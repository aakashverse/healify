import re
from app.core.config import settings
from app.services.rag import get_langchain_docs

# checks if text have hindi chars
def is_hindi(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text))

# formats langchain docs into plain context string
def format_docs(docs):
    return "\n\n".join(f"[{i+1}] ({d.metadata['source']}):\n{d.page_content}" for i, d in enumerate(docs))

# fallback answer
def offline_answer(query: str, docs: list) -> str:
    primary = docs[0].page_content if docs else ""
    hindi = is_hindi(query) or any(w in query.lower() for w in ["dard", "bukhar", "dast", "ulti", "kya", "hai", "kaise"])

    if "Diarrhea" in primary or "दस्त" in primary:
        if hindi:
            return (
                "1. एक पैकेट ओआरएस (ORS) को 1 लीटर साफ उबले पानी में घोलें और बार-बार घूंट-घूंट पिएं। "
                "2. यदि ओआरएस न हो तो घर पर 1 लीटर पानी में 6 चम्मच चीनी और आधा चम्मच नमक मिलाकर दें। "
                "3. यदि उल्टी या दस्त 2 दिन से ज्यादा रहे या कमजोरी ज्यादा हो तो तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।"
            )
        return (
            "1. Mix 1 sachet of ORS in 1 liter of clean drinking water and take frequent sips. "
            "2. Continue light meals, coconut water, or rice water to prevent dehydration. "
            "3. If diarrhea persists for more than 48 hours or you feel severe weakness, visit the nearest Primary Health Centre (PHC)."
        )
    elif "Fever" in primary or "बुखार" in primary:
        if hindi:
            return (
                "1. मरीज को हवादार जगह पर रखें और माथे व बदन पर सादे पानी की पट्टी रखें। "
                "2. खूब पानी, दाल का पानी या नींबू पानी पिलाएं ताकि शरीर में पानी की कमी न हो। "
                "3. यदि बुखार 48 घंटे से ज्यादा रहे या तेज कंपकंपी हो तो मलेरिया/डेंगू की जांच के लिए तुरंत PHC जाएं।"
            )
        return (
            "1. Rest in a well-ventilated room and apply normal water sponges to forehead and body. "
            "2. Drink plenty of fluids like lemon water, thin dal, or ORS to stay hydrated. "
            "3. If fever lasts more than 48 hours or includes severe chills, visit the nearest PHC for a blood test."
        )
    elif "Maternal" in primary or "गर्भावस्था" in primary:
        if hindi:
            return (
                "1. गर्भावस्था के दौरान कम से कम 4 नियमित जांच (ANC) नजदीकी उप-स्वास्थ्य केंद्र या PHC पर कराएं। "
                "2. हरी पत्तेदार सब्जियां, गुड़, दालें और आयरन-फोलिक एसिड की गोलियां नियमित लें। "
                "3. यदि तेज पेट दर्द, चक्कर या रक्तस्राव हो तो तुरंत अस्पताल जाएं।"
            )
        return (
            "1. Complete regular antenatal checkups at your nearest PHC or sub-centre. "
            "2. Take daily Iron-Folic Acid tablets and eat iron-rich foods like green leafy vegetables and lentils. "
            "3. If severe pain, bleeding, or dizziness occurs, visit the hospital immediately."
        )
    elif "Snakebite" in primary or "सांप" in primary:
        if hindi:
            return (
                "1. मरीज को बिल्कुल शांत और स्थिर रखें, हिलाएं-डुलाएं नहीं। "
                "2. घाव पर चीरा न लगाएं और न ही मुंह से जहर चूसें। "
                "3. मरीज को तुरंत नजदीकी अस्पताल ले जाएं जहां एंटी-स्नेक वेनम (ASV) उपलब्ध हो।"
            )
        return (
            "1. Keep the person completely still and calm. "
            "2. Do not cut the wound or try to suck venom. "
            "3. Rush immediately to the nearest PHC/hospital for anti-snake venom."
        )
    else:
        if hindi:
            return (
                "1. साफ पानी पिएं और पर्याप्त आराम करें। "
                "2. यदि लक्षण बने रहें या परेशानी बढ़े तो नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) जाकर डॉक्टर से सलाह लें।"
            )
        return (
            "1. Rest and drink plenty of clean fluids. "
            "2. If symptoms do not improve, please visit the nearest Primary Health Centre (PHC) for an examination."
        )

# generates medical response [CONTEXTed fmro who & icmr guidelines]
def response(query: str):
    docs = get_langchain_docs(query, k=2)
    sources = sorted(list({d.metadata["source"] for d in docs}))

    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import StrOutputParser

            system_prompt = (
                "You are an AI Rural Healthcare Assistant for low-literacy users in India.\n"
                "Ground your answer STRICTLY in the provided WHO and ICMR guidelines.\n"
                "Reply in the exact same language (Hindi or English) as the user's message.\n"
                "Keep your answer to at most 3-4 short, simple, actionable sentences.\n"
                "Do NOT prescribe prescription medicines. Always advise visiting the nearest Primary Health Centre (PHC) if symptoms persist.\n\n"
                "Verified Context:\n{context}"
            )

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{question}")
            ])

            llm = ChatGoogleGenerativeAI(
                model=settings.LLM_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3
            )

            # using chain for better functioning [& kam code likhne ke liye]
            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({"context": format_docs(docs), "question": query})
            print("LLM Response: ", result)
            return result.strip(), sources
        except Exception:
            pass

    # fallback
    fallback_text = offline_answer(query, docs)
    return fallback_text, sources
