import re
import logging
from app.core.config import settings
from app.services.rag import get_langchain_docs

logger = logging.getLogger(__name__)

def is_hindi(text: str) -> bool:
    return bool(re.search(r"[\u0900-\u097F]", text)) or any(w in text.lower() for w in [
        "dard", "bukhar", "dast", "ulti", "kya", "hai", "kaise", "khasi", "kamzori", "chot", "ghav", "mujhe", "mera"
    ])

def format_docs(docs):
    if not docs:
        return ""
    return "\n\n".join(f"[{i+1}] ({d.metadata.get('source', 'Clinical Reference')}):\n{d.page_content}" for i, d in enumerate(docs))

def extract_text_from_ai_message(content) -> str:
    """Safely extracts plain text from AIMessage.content whether str, list of dicts, or TextAccessor."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for part in content:
            if isinstance(part, str):
                parts.append(part)
            elif isinstance(part, dict) and "text" in part:
                val = part.get("text")
                if val:
                    parts.append(str(val))
            elif hasattr(part, "text"):
                val = getattr(part, "text")
                if val:
                    parts.append(str(val))
        return "".join(parts)
    return str(content) if content is not None else ""

def is_network_offline_error(err: Exception) -> bool:
    msg = str(err).lower()
    return any(k in msg for k in [
        "getaddrinfo failed", "connecterror", "connection error", "connection refused",
        "name resolution", "no internet", "network is unreachable"
    ])

def build_system_prompt(context: str = "") -> str:
    prompt = (
        "You are Cura AI (क्यूरा AI), a friendly, compassionate, and knowledgeable healthcare assistant for Heal-U.\n"
        "Your mission is to help people understand their illnesses, symptoms, and health questions in a warm, caring, and comforting manner — just like a trusted family doctor speaking with a patient.\n\n"
        "Core Guidelines:\n"
        "1. CONVERSATION CONTEXT & MEMORY: Remember and build upon the previous conversation turns with the user. If the user refers to something previously discussed (e.g. 'can I take it?', 'is this contagious?', 'what about for my child?'), maintain full context and give coherent, continuous advice.\n"
        "2. EMPATHY & TONE: Be warm, friendly, reassuring, and conversational. Acknowledge and empathize with how the user feels (e.g. 'I'm sorry to hear that you're in pain', 'घबराएं नहीं, आइए इसे समझते हैं'). Never sound like a cold, bureaucratic rulebook or brochure.\n"
        "3. LANGUAGE: Respond naturally in the EXACT SAME language the user asked in (Hindi, English, or conversational Hinglish). Keep explanations simple and jargon-free so that anyone can easily understand.\n"
        "4. EXPLANATION: Clearly and gently explain potential causes or factors contributing to their symptoms in everyday terms.\n"
        "5. PRACTICAL COMFORT & HOME CARE: Suggest practical home care measures, soothing remedies, hydration, nutrition, and rest.\n"
        "6. SAFE OVER-THE-COUNTER ADVICE: If relevant, mention safe common over-the-counter options (such as Paracetamol for fever or body ache, ORS for dehydration, warm salt water gargle for throat) with appropriate precautions. Never prescribe restricted prescription medicines or antibiotics.\n"
        "7. DANGER SIGNS & WHEN TO VISIT A DOCTOR: Gently mention warning signs they should keep an eye on, and encourage visiting a qualified doctor, clinic, or nearby Primary Health Centre (PHC) if symptoms persist, worsen, or cause significant distress."
    )
    if context and context.strip():
        prompt += f"\n\nOptional Clinical Knowledge Reference (use only if helpful):\n{context}"
    return prompt

def friendly_emergency_fallback(query: str) -> str:
    """Warm, friendly response used only if all remote AI service calls are completely unreachable."""
    if is_hindi(query):
        return (
            "नमस्ते! मैं समझ सकता हूँ कि आप अभी अस्वस्थ महसूस कर रहे हैं, और मैं आपकी पूरी मदद करना चाहता हूँ। "
            "अभी हमारे मुख्य AI सर्वर से संपर्क करने में थोड़ी तकनीकी समस्या आ रही है, लेकिन आप बिल्कुल परेशान न हों।\n\n"
            "अभी के लिए कुछ जरूरी और सुरक्षित सलाह:\n"
            "• **पर्याप्त आराम करें:** शरीर को तनाव न दें और पूरी नींद लें।\n"
            "• **तरल पदार्थ व पानी:** साफ उबला या गुनगुना पानी, ओआरएस (ORS), नारियल पानी या हल्का सूप घूंट-घूंट पीते रहें।\n"
            "• **हल्का आहार:** सुपाच्य भोजन जैसे खिचड़ी, दलिया या फल खाएं।\n"
            "• **सावधानी:** बिना डॉक्टर या फार्मासिस्ट की सलाह के कोई तेज एंटीबायोटिक या नई दवा न लें।\n"
            "• **डॉक्टर से परामर्श:** यदि आपकी तकलीफ बहुत ज्यादा है, तेज बुखार 48 घंटे से न उतरे, या सांस लेने में परेशानी हो, तो बिना देर किए नजदीकी डॉक्टर या प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।\n\n"
            "कृपया कुछ ही पलों में मुझसे पुनः पूछें, मैं हमेशा आपके स्वास्थ्य के लिए उपस्थित हूँ!"
        )
    return (
        "Hello! I understand you are feeling unwell, and I truly want to help you feel better. "
        "Our main AI service is experiencing a brief connectivity hiccup right now, but please don't worry.\n\n"
        "Here are some safe, immediate steps you can take:\n"
        "• **Rest & Recover:** Give your body plenty of restful sleep and avoid strenuous activity.\n"
        "• **Stay Well-Hydrated:** Drink plenty of clean boiled/warm water, ORS fluids, herbal tea, or clear soups.\n"
        "• **Nourishing Food:** Stick to light, easily digestible meals like porridge, khichdi, or fruits.\n"
        "• **Caution:** Avoid taking strong medications or unprescribed antibiotics on your own.\n"
        "• **When to Seek Care:** If your symptoms are severe, worsening, or accompanied by high fever or shortness of breath, please visit a local physician or your nearest health clinic promptly.\n\n"
        "Please feel free to ask me again in just a moment — I am always here to support your health!"
    )

def response(query: str, history: list = None):
    if history is None:
        history = []

    # 1. Contextual search query: if query is a brief follow-up, include recent user query for retrieval
    search_query = query
    if len(query.split()) < 4 and history:
        for prev in reversed(history):
            if prev.get("role") in ["user", "human"] and prev.get("content"):
                search_query = f"{prev['content']} {query}"
                break

    docs = get_langchain_docs(search_query, k=2)
    sources = list(dict.fromkeys(d.metadata.get("source") for d in docs if d.metadata.get("source")))
    if not sources:
        sources = ["Cura AI Health Knowledge"]

    context_str = format_docs(docs)
    system_prompt = build_system_prompt(context_str)

    preferred_model = settings.LLM_MODEL or "gemini-3.8-flash"
    candidate_models = []
    for m in [preferred_model, "gemini-3.8-flash", "gemini-3.5-flash-lite"]:
        if m and m not in candidate_models:
            candidate_models.append(m)

    network_is_offline = False

    # 2. Try Google GenAI official SDK with full multi-turn conversation memory
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip():
        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.GEMINI_API_KEY)

            # Build multi-turn content items
            contents_list = []
            for turn in history:
                content_text = turn.get("content", "").strip()
                if not content_text:
                    continue
                turn_role = "user" if turn.get("role") in ["user", "human"] else "model"
                contents_list.append(types.Content(
                    role=turn_role,
                    parts=[types.Part.from_text(text=content_text)]
                ))

            # Add current user prompt
            contents_list.append(types.Content(
                role="user",
                parts=[types.Part.from_text(text=query)]
            ))

            for model_name in candidate_models:
                try:
                    res = client.models.generate_content(
                        model=model_name,
                        contents=contents_list,
                        config=types.GenerateContentConfig(
                            system_instruction=system_prompt,
                            temperature=0.6,
                        )
                    )
                    if res and res.text and res.text.strip():
                        return res.text.strip(), sources
                except Exception as model_err:
                    logger.warning(f"google.genai with model {model_name} failed: {model_err}")
                    if is_network_offline_error(model_err):
                        network_is_offline = True
                        break
                    continue
        except Exception as sdk_err:
            logger.warning(f"google.genai SDK initialization note: {sdk_err}")
            if is_network_offline_error(sdk_err):
                network_is_offline = True

        # 3. Try LangChain ChatGoogleGenerativeAI if network is not completely down
        if not network_is_offline:
            try:
                from langchain_google_genai import ChatGoogleGenerativeAI
                from langchain_core.messages import SystemMessage, HumanMessage, AIMessage

                lc_messages = [SystemMessage(content=system_prompt)]
                for turn in history:
                    content_text = turn.get("content", "").strip()
                    if not content_text:
                        continue
                    if turn.get("role") in ["user", "human"]:
                        lc_messages.append(HumanMessage(content=content_text))
                    else:
                        lc_messages.append(AIMessage(content=content_text))

                lc_messages.append(HumanMessage(content=query))

                for model_name in candidate_models:
                    try:
                        llm = ChatGoogleGenerativeAI(
                            model=model_name,
                            google_api_key=settings.GEMINI_API_KEY,
                            temperature=0.6,
                        )
                        res = llm.invoke(lc_messages)
                        raw_content = getattr(res, "content", res)
                        text = extract_text_from_ai_message(raw_content).strip()
                        if text:
                            return text, sources
                    except Exception as model_err:
                        logger.warning(f"ChatGoogleGenerativeAI with model {model_name} failed: {model_err}")
                        if is_network_offline_error(model_err):
                            break
                        continue
            except Exception as lc_err:
                logger.warning(f"Langchain fallback note: {lc_err}")

    # 4. Friendly caring fallback if network is completely down
    return friendly_emergency_fallback(query), sources
