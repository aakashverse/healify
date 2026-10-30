import re
from app.core.config import settings
from app.services.rag import get_langchain_docs

def is_hindi(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text))

def format_docs(docs):
    return "\n\n".join(f"[{i+1}] ({d.metadata.get('source', 'Clinical Guideline')}):\n{d.page_content}" for i, d in enumerate(docs))

# fallback
def offline_answer(query: str, docs: list) -> str:
    primary_doc = docs[0] if docs else None
    category = primary_doc.metadata.get("category", "") if primary_doc else ""
    primary_content = primary_doc.page_content if primary_doc else ""
    
    hindi = is_hindi(query) or any(w in query.lower() for w in [
        "dard", "bukhar", "dast", "ulti", "kya", "hai", "kaise", "khasi", "kamzori", "saanp", "chot", "ghav"
    ])

    # 1. Fever / Malaria / Dengue
    if category == "fever" or "Fever" in primary_content or "बुखार" in primary_content:
        if hindi:
            return (
                "1. मरीज को हवादार और ठंडी जगह पर रखें। माथे, हाथ और पैरों पर सादे सामान्य पानी की पट्टी रखें (बर्फ का पानी न लगाएं)।\n"
                "2. शरीर में पानी की कमी न होने दें—खूब पानी, दाल का पानी, नींबू पानी या ओआरएस (ORS) पिलाएं।\n"
                "3. तेज बुखार के लिए डॉक्टर की सलाह से पैरासिटामोल (PCM) दी जा सकती है। बिना जांच एस्पिरिन या ब्रूफेन न लें।\n"
                "4. यदि बुखार 48 घंटे से अधिक रहे या तेज कंपकंपी/जाड़ा लगे, तो मलेरिया या डेंगू की जांच के लिए तुरंत नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।"
            )
        return (
            "1. Rest in a well-ventilated, cool room. Apply normal room-temperature water sponges to forehead and body (avoid cold or ice water).\n"
            "2. Keep well hydrated with plenty of fluids such as boiled water, lemon water, thin lentils (dal), or ORS.\n"
            "3. Paracetamol can help reduce fever under appropriate guidance. Avoid Aspirin or Ibuprofen without testing as Dengue risk may increase.\n"
            "4. If fever persists beyond 48 hours or is accompanied by intense shivering or chills, visit the nearest Primary Health Centre (PHC) for malaria/dengue blood screening."
        )

    # 2. Diarrhea / Dehydration / ORS
    elif category == "dehydration" or "Diarrhea" in primary_content or "दस्त" in primary_content:
        if hindi:
            return (
                "1. एक पैकेट ओआरएस (ORS) को ठीक 1 लीटर साफ उबले हुए ठंडे पानी में घोलें और हर बार दस्त के बाद घूंट-घूंट पिएं।\n"
                "2. यदि ओआरएस पैकेट न हो, तो घर पर 1 लीटर पानी में 6 छोटी चम्मच चीनी और आधा चम्मच नमक मिलाकर घोल तैयार करें।\n"
                "3. हल्का व सुपाच्य भोजन (खिचड़ी, नारियल पानी, चावल का पानी) जारी रखें।\n"
                "4. यदि उल्टी-दस्त 24-48 घंटे से ज्यादा रहे, पेशाब बंद हो या अत्यधिक कमजोरी हो, तो तुरंत नजदीकी PHC जाएं।"
            )
        return (
            "1. Dissolve 1 sachet of ORS in exactly 1 liter of clean, boiled and cooled drinking water. Sip regularly, especially after each loose stool.\n"
            "2. If ORS sachets are unavailable, mix 6 level teaspoons of sugar and half a teaspoon of salt into 1 liter of clean water.\n"
            "3. Continue light home-cooked meals such as rice water, khichdi, or tender coconut water to prevent weakness.\n"
            "4. If diarrhea persists beyond 48 hours, or if there is severe drowsiness or blood in stool, visit the nearest Primary Health Centre (PHC) immediately."
        )

    # 3. Respiratory / Cough / Cold / Pneumonia
    elif category == "respiratory" or "Cough" in primary_content or "खांसी" in primary_content:
        if hindi:
            return (
                "1. सीने और गले को गर्म रखें। गुनगुना पानी, अदरक-तुलसी की चाय या गर्म सूप पिएं।\n"
                "2. बंद नाक के लिए सादे गुनगुने नमक-पानी की भाप लें या सेलाइन नेजल ड्रॉप्स का उपयोग करें।\n"
                "3. बच्चों में ध्यान दें: यदि सांस बहुत तेज चल रही हो या सांस लेते समय पसली अंदर धंस रही हो, तो यह निमोनिया का संकेत हो सकता है।\n"
                "4. खांसी 5 दिन से ज्यादा रहे या सांस फूलने लगे तो बिना देरी किए नजदीकी स्वास्थ्य केंद्र (PHC/CHC) जाकर जांच कराएं।"
            )
        return (
            "1. Keep chest warm and drink soothing warm fluids like ginger tea, warm water, or light broth.\n"
            "2. Inhale plain warm steam to loosen phlegm and clear nasal congestion.\n"
            "3. For young children, watch for danger signs: fast breathing or chest indrawing (sucking inward) which indicates acute pneumonia.\n"
            "4. If cough lasts over 5 days, produces dark phlegm, or is accompanied by breathlessness, visit the nearest PHC/CHC promptly."
        )

    # 4. Maternal Care / Pregnancy
    elif category == "maternal" or "Maternal" in primary_content or "गर्भावस्था" in primary_content:
        if hindi:
            return (
                "1. गर्भावस्था के दौरान नजदीकी उप-स्वास्थ्य केंद्र या PHC पर कम से कम 4 नियमित जांच (ANC) अवश्य कराएं।\n"
                "2. रोज आयरन-फोलिक एसिड (IFA) की गोली लें और हरी पत्तेदार सब्जियां, गुड़, चना, दालें व फल खाएं।\n"
                "3. गर्भावस्था में दो टिटनेस (TT) के टीके समय पर लगवाएं और भारी वजन उठाने से बचें।\n"
                "4. चेतावनी: यदि तेज पेट दर्द, चक्कर, आंखों में धुंधलापन या रक्तस्राव (bleeding) हो, तो तुरंत 102/108 एम्बुलेंस बुलाकर अस्पताल जाएं।"
            )
        return (
            "1. Ensure at least 4 routine Antenatal Checkups (ANC) are completed at your nearest Sub-Centre or PHC.\n"
            "2. Take daily Iron-Folic Acid (IFA) tablets and consume iron-rich foods: green leafy vegetables, lentils, jaggery, and seasonal fruits.\n"
            "3. Receive two doses of Tetanus Toxoid (TT) vaccines during pregnancy.\n"
            "4. Emergency Warning: If you experience severe abdominal pain, vaginal bleeding, or blurred vision, call 102/108 or rush to the nearest CHC immediately."
        )

    # 5. Anemia & Chronic Weakness
    elif category == "anemia" or "Anemia" in primary_content or "कमजोरी" in primary_content:
        if hindi:
            return (
                "1. खून की कमी (एनीमिया) दूर करने के लिए पालक, मेथी, सहजन की पत्तियां, भुना चना, गुड़ और अंकुरित अनाज खाएं।\n"
                "2. खाने के साथ नींबू, आंवला या अमरूद लें—विटामिन सी शरीर में आयरन सोखने में मदद करता है।\n"
                "3. खाने के तुरंत बाद गाढ़ी चाय या कॉफी न पिएं क्योंकि इससे आयरन का असर कम हो जाता है।\n"
                "4. नजदीकी PHC पर जाकर हीमोग्लोबिन (Hb) की निःशुल्क जांच कराएं और डॉक्टर की सलाह से आयरन सिरप/गोलियां लें।"
            )
        return (
            "1. Increase iron-rich dietary sources: green leafy vegetables (spinach, moringa), jaggery, roasted chickpeas, and lentils.\n"
            "2. Pair meals with Vitamin-C sources (lemon, amla, guava) to enhance natural iron absorption in the gut.\n"
            "3. Avoid drinking strong tea or coffee immediately after meals as tannins inhibit iron absorption.\n"
            "4. Visit the local PHC for a simple, free Hemoglobin prick test and obtain appropriate iron supplements if advised."
        )

    # 6. Snakebite First Aid
    elif category == "snakebite" or "Snake" in primary_content or "सांप" in primary_content:
        if hindi:
            return (
                "1. मरीज को बिल्कुल शांत और स्थिर रखें, हिलने-डुलने न दें (मूवमेंट से जहर तेजी से फैलता है)।\n"
                "2. घाव के पास की अंगूठी, घड़ी, तंग कपड़े तुरंत उतार लें। घाव को दिल के स्तर से नीचे रखें।\n"
                "3. सख्त मनाही: घाव पर कट न लगाएं, मुंह से जहर न चूसें और न ही कसकर रस्सी बांधें।\n"
                "4. तुरंत 108 पर कॉल करें और उस नजदीकी अस्पताल ले जाएं जहां एंटी-स्नेक वेनम (ASV) उपलब्ध हो।"
            )
        return (
            "1. Keep the victim completely still and calm; physical movement accelerates venom circulation in the bloodstream.\n"
            "2. Immobilize the limb using a splint or sling, keeping it below heart level. Remove all rings, tight bangles, and footwear.\n"
            "3. STRICTLY AVOID cutting the wound, sucking venom, or applying tight tourniquets.\n"
            "4. Dial 108 ambulance immediately and transport to the nearest facility stocked with Anti-Snake Venom (ASV)."
        )

    # 7. Heatstroke / Loo / Sunstroke
    elif category == "heatstroke" or "Heat" in primary_content or "लू" in primary_content:
        if hindi:
            return (
                "1. मरीज को तुरंत ठंडी, छायादार जगह पर लिटाएं और कपड़े ढीले करें।\n"
                "2. सादे पानी से बदन पोंछें और पंखा चलाएं ताकि शरीर का तापमान सामान्य हो सके।\n"
                "3. यदि मरीज होश में हो तो आम का पना, छाछ, नींबू पानी या ओआरएस (ORS) का घोल घूंट-घूंट पिलाएं।\n"
                "4. यदि पसीना आना बंद हो जाए, त्वचा गर्म व सूखी हो या मरीज बेहोश होने लगे, तो तुरंत अस्पताल ले जाएं।"
            )
        return (
            "1. Move the person to a cool, shaded environment immediately and loosen tight clothing.\n"
            "2. Sponge body with room-temperature water and fan vigorously to lower core temperature.\n"
            "3. If conscious, offer cool fluids, buttermilk, raw mango drink, or ORS in frequent small sips.\n"
            "4. If patient exhibits dry hot skin, confusion, or loss of consciousness, seek emergency hospitalization immediately."
        )

    # 8. Minor Wound, Burn or Cut Care
    elif category == "wound_care" or "Wound" in primary_content or "चोट" in primary_content:
        if hindi:
            return (
                "1. कटे हुए घाव को 5 मिनट तक साफ बहते पानी और हल्के साबुन से धोएं। साफ कपड़े से दबाकर खून रोकें।\n"
                "2. जलने पर: जले हुए अंग पर तुरंत 15-20 मिनट तक सादा ठंडा नल का पानी डालें। टूथपेस्ट, घी या गोबर कभी न लगाएं।\n"
                "3. यदि घाव पर जंग लगा लोहा या मिट्टी लगी हो, तो 24 घंटे के अंदर PHC जाकर टिटनेस (TT) का टीका लगवाएं।\n"
                "4. यदि घाव गहरा हो, खून न रुक रहा हो या मवाद बनने लगे, तो डॉक्टर को तुरंत दिखाएं।"
            )
        return (
            "1. For cuts: Cleanse wound under clean running tap water with mild soap for 5 minutes. Apply firm pressure with a clean cloth to stop bleeding.\n"
            "2. For burns: Place affected area under cool running water for 15-20 minutes immediately. Never apply toothpaste, ink, or ghee.\n"
            "3. If injured by rusty metals or soil, obtain a Tetanus Toxoid (TT) booster within 24 hours at the PHC.\n"
            "4. Visit the PHC if the wound is gaping deep, won't stop bleeding after 10 minutes of pressure, or shows signs of infection."
        )

    # Default general guidance
    else:
        if hindi:
            return (
                "1. पर्याप्त आराम करें और साफ उबला हुआ पानी व तरल पदार्थ खूब पिएं।\n"
                "2. अपने लक्षणों पर नजर रखें और बिना डॉक्टर की सलाह के कोई एंटीबायोटिक या अनजान दवा न लें।\n"
                "3. यदि परेशानी 24 से 48 घंटे में ठीक न हो या बढ़ने लगे, तो नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) जाकर डॉक्टर से परामर्श लें।"
            )
        return (
            "1. Get adequate rest and drink plenty of clean boiled water and oral fluids.\n"
            "2. Monitor your symptoms closely and avoid taking unprescribed antibiotics or strong medications without medical consultation.\n"
            "3. If symptoms persist beyond 48 hours or worsen, visit your nearest Primary Health Centre (PHC) for clinical evaluation."
        )

# main rag
def response(query: str):
    docs = get_langchain_docs(query, k=2)
    
    sources = list(dict.fromkeys(d.metadata.get("source") for d in docs if d.metadata.get("source")))

    if not sources:
        sources = ["WHO & ICMR Clinical Guidelines"]

    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and not settings.GEMINI_API_KEY.startswith("AQ."):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.prompts import ChatPromptTemplate
            from langchain_core.output_parsers import StrOutputParser

            system_prompt = (
                "You are an AI Rural Healthcare Assistant for low-literacy users in India.\n"
                "Ground your answer STRICTLY in the provided WHO and ICMR guidelines.\n"
                "Reply in the exact same language (Hindi or English) as the user's message.\n"
                "Keep your answer to at most 3-4 short, simple, actionable points.\n"
                "Do NOT prescribe prescription medicines. Always advise visiting the nearest Primary Health Centre (PHC) if symptoms persist.\n\n"
                "Verified Context:\n{context}"
            )

            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                ("human", "{question}")
            ])

            model_name = "gemini-1.5-flash" if "3.8" in settings.LLM_MODEL else settings.LLM_MODEL
            llm = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.3
            )

            chain = prompt | llm | StrOutputParser()
            result = chain.invoke({"context": format_docs(docs), "question": query})
            return result.strip(), sources
        except Exception as e:
            pass

    fallback_text = offline_answer(query, docs)
    return fallback_text, sources
