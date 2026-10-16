from app.core.config import settings

# fallback
DEFAULT_DOSAGE_CARD = {
    "medicines": [
        {
            "name": "Paracetamol 500mg",
            "purpose_en": "For fever and body pain",
            "purpose_hi": "बुखार और बदन दर्द के लिए",
            "schedule": {
                "morning": True,
                "afternoon": False,
                "night": True
            },
            "meal_timing": "after_food",
            "duration": "3 to 5 days",
            "audio_hi": "सुबह और रात को खाना खाने के बाद 1 गोली लें।",
            "audio_en": "Take one tablet in the morning and night after food.",
            "warning": "Do not take on empty stomach"
        },
        {
            "name": "ORS (Oral Rehydration Salts)",
            "purpose_en": "To prevent dehydration and weakness",
            "purpose_hi": "शरीर में पानी की कमी दूर करने के लिए",
            "schedule": {
                "morning": True,
                "afternoon": True,
                "night": True
            },
            "meal_timing": "anytime",
            "duration": "Throughout the day",
            "audio_hi": "दिन भर 1 लीटर पानी में घोलकर घूंट-घूंट पिएं।",
            "audio_en": "Sip regularly throughout the day mixed in 1 liter of clean water.",
            "warning": "Use within 24 hours of preparation"
        }
    ],
    "general_advice_hi": "दवा समय पर लें और पूरा आराम करें। परेशानी बढ़ने पर तुरंत PHC जाएं।",
    "general_advice_en": "Take medicines on time and rest. Visit nearest PHC if symptoms persist.",
    "_meta": {
        "engine": "offline-fallback",
        "reason": "Default guideline template"
    }
}

# dynamic card generator based on filename when offline or quota is exhausted
def generate_fallback_card(file_name: str = ""):
    fn = file_name.lower()
    
    if any(k in fn for k in ["cough", "syrup", "khasi", "cold"]):
        return {
            "medicines": [
                {
                    "name": "Cough Relief Syrup (खांसी का सिरप)",
                    "purpose_en": "Relief from dry and chest cough",
                    "purpose_hi": "खांसी और गले की खराश के लिए",
                    "schedule": {"morning": True, "afternoon": True, "night": True},
                    "meal_timing": "after_food",
                    "duration": "5 days",
                    "audio_hi": "दिन में तीन बार खाना खाने के बाद 2 चम्मच सिरप पिएं।",
                    "audio_en": "Take two teaspoons three times a day after meals.",
                    "warning": "Do not drink cold water right after syrup"
                }
            ],
            "general_advice_hi": "गुनगुना पानी पिएं और ठंडी चीजों से परहेज करें।",
            "general_advice_en": "Drink warm water and avoid cold drinks.",
            "_meta": {"engine": "offline-smart-fallback", "detected_hint": "cough/cold"}
        }
    elif any(k in fn for k in ["amox", "antibiotic", "infect"]):
        return {
            "medicines": [
                {
                    "name": "Amoxicillin 500mg (एंटीबायोटिक)",
                    "purpose_en": "To clear bacterial infection",
                    "purpose_hi": "बैक्टीरियल इन्फेक्शन ठीक करने के लिए",
                    "schedule": {"morning": True, "afternoon": False, "night": True},
                    "meal_timing": "after_food",
                    "duration": "5 full days",
                    "audio_hi": "सुबह और रात को खाना खाने के बाद 1 गोली लें, कोर्स पूरा करें।",
                    "audio_en": "Take one capsule morning and night after food for full course.",
                    "warning": "Do not skip doses, complete the course"
                }
            ],
            "general_advice_hi": "डॉक्टर द्वारा बताया गया कोर्स पूरा करें, बीच में दवा न छोड़ें।",
            "general_advice_en": "Complete the full antibiotic course as prescribed.",
            "_meta": {"engine": "offline-smart-fallback", "detected_hint": "antibiotic"}
        }
    elif any(k in fn for k in ["allergy", "cetirizine", "khujli"]):
        return {
            "medicines": [
                {
                    "name": "Cetirizine 10mg (एलर्जी की दवा)",
                    "purpose_en": "For itching, allergy, and sneezing",
                    "purpose_hi": "खुजली और छींक-एलर्जी के लिए",
                    "schedule": {"morning": False, "afternoon": False, "night": True},
                    "meal_timing": "after_food",
                    "duration": "3 days",
                    "audio_hi": "रात को सोने से पहले खाना खाने के बाद 1 गोली लें।",
                    "audio_en": "Take one tablet at night before sleeping after food.",
                    "warning": "May cause mild drowsiness"
                }
            ],
            "general_advice_hi": "दवा लेने के बाद भारी मशीन न चलाएं क्योंकि इससे नींद आ सकती है।",
            "general_advice_en": "Avoid driving after taking medicine as it causes sleepiness.",
            "_meta": {"engine": "offline-smart-fallback", "detected_hint": "allergy/cetirizine"}
        }

    return DEFAULT_DOSAGE_CARD

# parses prescription or medicine image
def explain_prescription(image_base64: str = None, mime_type: str = "image/jpeg", file_name: str = ""):
    if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY.strip() and image_base64:
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            from langchain_core.messages import HumanMessage
            from langchain_core.output_parsers import JsonOutputParser

            prompt = (
                "You are a medical assistant helping rural low-literacy patients in India understand photographed prescriptions or medicine blister strips.\n"
                "Extract the medication details and dosage timings in the following strict JSON format:\n"
                "{\n"
                '  "medicines": [\n'
                "    {\n"
                '      "name": "Medicine Name and dosage (e.g. Paracetamol 500mg)",\n'
                '      "purpose_en": "Short purpose in English",\n'
                '      "purpose_hi": "Short purpose in Hindi",\n'
                '      "schedule": {\n'
                '        "morning": true or false,\n'
                '        "afternoon": true or false,\n'
                '        "night": true or false\n'
                "      },\n"
                '      "meal_timing": "after_food" or "before_food" or "anytime",\n'
                '      "duration": "e.g. 5 days",\n'
                '      "audio_hi": "One simple sentence in Hindi explaining when to take it",\n'
                '      "audio_en": "One simple sentence in English explaining when to take it",\n'
                '      "warning": "Short precaution"\n'
                "    }\n"
                "  ],\n"
                '  "general_advice_hi": "Short encouraging advice in Hindi",\n'
                '  "general_advice_en": "Short encouraging advice in English"\n'
                "}\n"
                "Return JSON only."
            )

            # langchain multimodal message with image payload
            message = HumanMessage(
                content=[
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": f"data:{mime_type};base64,{image_base64}"
                    }
                ]
            )

            llm = ChatGoogleGenerativeAI(
                model=settings.LLM_MODEL,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=0.1
            )

            # invoke langchain model chain
            chain = llm | JsonOutputParser()
            result = chain.invoke([message])
            # result["_meta"] = {"engine": "langchain-gemini-vision", "status": "analyzed"}
            return result
        except Exception as e:
            print(f"Vision Engine Warning:  Gemini API call skipped or rate-limited: {e}")

    return generate_fallback_card(file_name)
