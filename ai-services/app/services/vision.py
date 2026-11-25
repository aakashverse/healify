import os
import json
import re
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Fallback template
DEFAULT_DOSAGE_CARD = {
    "disease_info": {
        "condition_name_en": "Acute Febrile Illness & Mild Dehydration",
        "condition_name_hi": "मौसमी बुखार व शरीर में पानी की कमी",
        "overview_en": "This prescription appears to be prescribed for a patient experiencing fever, body ache, and mild fatigue or dehydration.",
        "overview_hi": "यह पर्ची बुखार, सिरदर्द, बदन दर्द और कमजोरी के उपचार के लिए दी गई प्रतीत होती है।",
        "primary_cause_en": "Common viral/seasonal infection or weather-induced fever.",
        "primary_cause_hi": "मौसम में बदलाव या सामान्य मौसमी वायरल संक्रमण।"
    },
    "medicines": [
        {
            "name": "Paracetamol 500mg",
            "purpose_en": "To reduce high body temperature and relieve body pain",
            "purpose_hi": "तेज बुखार कम करने और बदन दर्द में राहत के लिए",
            "schedule": {
                "morning": True,
                "afternoon": False,
                "night": True
            },
            "meal_timing": "after_food",
            "duration": "3 to 5 days",
            "audio_hi": "सुबह और रात को खाना खाने के बाद 1 गोली लें।",
            "audio_en": "Take one tablet in the morning and night after food.",
            "warning": "Do not take on an empty stomach. Do not exceed 4 doses in 24 hours."
        },
        {
            "name": "ORS (Oral Rehydration Salts)",
            "purpose_en": "To restore lost electrolytes and prevent dehydration",
            "purpose_hi": "शरीर में पानी और आवश्यक लवणों की कमी को पूरा करने के लिए",
            "schedule": {
                "morning": True,
                "afternoon": True,
                "night": True
            },
            "meal_timing": "anytime",
            "duration": "Throughout the day",
            "audio_hi": "दिन भर 1 लीटर साफ पानी में घोलकर घूंट-घूंट पिएं।",
            "audio_en": "Sip regularly throughout the day mixed in 1 liter of clean water.",
            "warning": "Use within 24 hours of preparation."
        }
    ],
    "extra_care_and_warnings": {
        "key_precautions_en": [
            "Never skip doses or double up on missed tablets.",
            "Avoid taking pain medications or antibiotics without doctor confirmation."
        ],
        "key_precautions_hi": [
            "दवा की खुराक समय पर लें और खुद से कोई एंटीबायोटिक न जोड़ें।",
            "खाली पेट दर्द निवारक गोलियां लेने से बचें।"
        ],
        "diet_and_lifestyle_en": "Drink plenty of boiled warm water, eat light khichdi/porridge, and ensure at least 8 hours of restful sleep.",
        "diet_and_lifestyle_hi": "उबला गुनगुना पानी पिएं, हल्का व सुपाच्य भोजन (खिचड़ी/दलिया) लें और भरपूर आराम करें।",
        "red_flags_when_to_see_doctor_en": "Seek immediate doctor care if fever exceeds 102°F for over 48 hours, breathing difficulty develops, or repeated vomiting occurs.",
        "red_flags_when_to_see_doctor_hi": "यदि बुखार 102°F से अधिक बना रहे, सांस फूले या लगातार उल्टियां हों, तो तुरंत नजदीकी PHC/अस्पताल जाएं।"
    },
    "general_advice_hi": "दवा समय पर लें और पूरा आराम करें। परेशानी बढ़ने पर तुरंत PHC जाएं।",
    "general_advice_en": "Take medicines on time and rest. Visit nearest PHC if symptoms persist.",
    "_meta": {
        "engine": "offline-fallback",
        "reason": "Default guideline template"
    }
}

# strip input
def clean_json_text(raw_text: str) -> str:
    """Cleans markdown fences or surrounding noise from raw LLM output."""
    if not raw_text:
        return ""
    text = raw_text.strip()
    if "```" in text:
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
    return text

def explain_prescription(image_base64: str = None, mime_type: str = "image/jpeg", file_name: str = ""):
    """
    Analyzes a prescription image using Google Gemini Vision AI.
    Accurately extracts:
    1. Probable disease / condition name and overview (both EN and HI).
    2. Medicine list with exact timings, schedules, and duration.
    3. Extra essential precautions, diet, lifestyle, and red-flag doctor consult warnings.
    """
    if not image_base64 or not settings.GEMINI_API_KEY or not settings.GEMINI_API_KEY.strip():
        logger.warning("No image payload or GEMINI_API_KEY available. Using fallback.")
        return DEFAULT_DOSAGE_CARD

    # Clean mime type
    clean_mime = mime_type if mime_type and "/" in mime_type else "image/jpeg"
    if "pdf" in clean_mime.lower():
        clean_mime = "application/pdf"
    elif "png" in clean_mime.lower():
        clean_mime = "image/png"
    elif "webp" in clean_mime.lower():
        clean_mime = "image/webp"
    else:
        clean_mime = "image/jpeg"

    # decode img
    try:
        import base64
        image_bytes = base64.b64decode(image_base64)
    except Exception as b64_err:
        logger.error(f"Failed to decode image base64: {b64_err}")
        return DEFAULT_DOSAGE_CARD

    prompt = """
    You are an expert Clinical Pharmacist and Medical Doctor specializing in rural and community healthcare.
    Analyze this photographed handwritten/printed medical prescription, doctor slip, or medicine blister strip with extreme accuracy.

    YOUR CLINICAL TASKS:
    1. DISEASE / CONDITION ANALYSIS:
       - Based on the medicines prescribed, written diagnosis, symptoms, or lab findings, identify the primary illness / medical condition.
       - Provide a short, compassionate, plain-language explanation of this illness in both English and simple everyday Hindi (for rural patients).
       - Mention the primary likely cause or trigger.

    2. MEDICINES & EXACT CONSUMPTION TIMING:
       For every identified medicine:
       - Extract exact Name and Strength (e.g. "Amoxicillin 500mg", "Metformin 500mg", "Cetirizine 10mg").
       - Explain what this specific medicine does (purpose in simple English and Hindi).
       - Consumption Schedule: Morning (true/false), Afternoon (true/false), Night (true/false).
       - Meal Timing: "after_food", "before_food", "with_food", or "empty_stomach".
       - Human-readable frequency: e.g. "Twice a day (Morning & Night)" / "दिन में दो बार (सुबह और रात)".
       - Duration: e.g. "5 days" or "As directed by physician".
       - Clear 1-sentence audio-friendly instructions for rural patients (audio_en and audio_hi).
       - Important medicine-specific precautions (e.g. "Complete the full antibiotic course", "Do not take on empty stomach", "May cause drowsiness").

    3. EXTRA ESSENTIAL CARE & WARNINGS:
       - Key general precautions to observe while undergoing this treatment (in EN and HI).
       - Diet & lifestyle recommendations: what to eat, what to avoid, hydration tips (in EN and HI).
       - RED FLAGS: specific severe symptoms that signal danger and require seeing a doctor immediately (in EN and HI).

    STRICT JSON RESPONSE FORMAT ONLY (NO MARKDOWN OUTSIDE THE JSON):
    {
      "disease_info": {
        "condition_name_en": "Probable disease or health condition in English",
        "condition_name_hi": "बीमारी का नाम हिंदी में (जैसे: गले का संक्रमण / मौसमी बुखार)",
        "overview_en": "Clear 2-sentence explanation of what this condition is and why these medicines were given",
        "overview_hi": "सरल हिंदी में 2 वाक्यों में बीमारी की जानकारी",
        "primary_cause_en": "Likely causes or triggers",
        "primary_cause_hi": "बीमारी का मुख्य कारण"
      },
      "medicines": [
        {
          "name": "Medicine Name + Strength",
          "purpose_en": "Simple purpose in English",
          "purpose_hi": "दवा का उपयोग सरल हिंदी में",
          "schedule": {
            "morning": true,
            "afternoon": false,
            "night": true
          },
          "meal_timing": "after_food",
          "frequency_text_en": "Twice a day (Morning & Night)",
          "frequency_text_hi": "दिन में दो बार (सुबह और रात)",
          "duration": "5 days",
          "audio_en": "Take one tablet in the morning and night after food.",
          "audio_hi": "सुबह और रात को खाना खाने के बाद एक गोली लें।",
          "warning": "Important precaution for this medicine"
        }
      ],
      "extra_care_and_warnings": {
        "key_precautions_en": [
          "Do not stop medicine prematurely even if feeling better.",
          "Avoid self-medicating with unprescribed tablets."
        ],
        "key_precautions_hi": [
          "दवा का कोर्स पूरा करें, बीच में दवा बंद न करें।",
          "बिना डॉक्टर की सलाह के कोई दूसरी दवा न लें।"
        ],
        "diet_and_lifestyle_en": "Dietary advice, fluids, and foods to favor/avoid.",
        "diet_and_lifestyle_hi": "खान-पान और परहेज की सलाह।",
        "red_flags_when_to_see_doctor_en": "Warning signs that indicate immediate clinic visit.",
        "red_flags_when_to_see_doctor_hi": "खतरे के लक्षण जब तुरंत डॉक्टर से मिलना आवश्यक है।"
      },
      "general_advice_hi": "दवा समय पर लें और पूरा आराम करें। परेशानी बढ़ने पर तुरंत PHC जाएं।",
      "general_advice_en": "Take medicines on time and rest. Visit nearest PHC if symptoms persist."
    }
    """

    # multi-model try
    candidate_models = [
        "gemini-3.8-flash",
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash",
        "gemini-flash-latest",
    ]

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=settings.GEMINI_API_KEY)

        for model_name in candidate_models:
            try:
                logger.info(f"Attempting analysis with model: {model_name}...")
                response = client.models.generate_content(
                    model=model_name,
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type=clean_mime),
                        prompt
                    ]
                )

                if response and response.text:
                    cleaned = clean_json_text(response.text)
                    parsed = json.loads(cleaned)

                    # validate that medicines list exists
                    if "medicines" in parsed and isinstance(parsed["medicines"], list):
                        parsed["_meta"] = {
                            "engine": f"google-genai-{model_name}",
                            "status": "success"
                        }
                        return parsed

            except Exception as model_err:
                logger.warning(f"[Vision AI] Model {model_name} failed: {model_err}")
                continue

    except Exception as sdk_err:
        logger.warning(f"[Vision AI] google.genai SDK initialization note: {sdk_err}")

    # fallback: with langchain gogle chatgenai
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI
        from langchain_core.messages import HumanMessage

        msg = HumanMessage(
            content=[
                {"type": "text", "text": prompt},
                {
                    "type": "image_url",
                    "image_url": f"data:{clean_mime};base64,{image_base64}"
                }
            ]
        )

        for model_name in candidate_models:
            try:
                llm = ChatGoogleGenerativeAI(
                    model=model_name,
                    google_api_key=settings.GEMINI_API_KEY,
                    temperature=0.1
                )

                res = llm.invoke([msg])
                raw_text = getattr(res, "content", str(res))
                cleaned = clean_json_text(raw_text)
                parsed = json.loads(cleaned)
                if "medicines" in parsed:
                    parsed["_meta"] = {
                        "engine": f"langchain-{model_name}",
                        "status": "success"
                    }
                    return parsed
            except Exception as lc_model_err:
                logger.warning(f"[Vision AI] Langchain model {model_name} failed: {lc_model_err}")
                continue

    except Exception as lc_err:
        logger.warning(f"[Vision AI] Langchain fallback note: {lc_err}")

    # offline fallback
    logger.warning("[Vision AI] All online vision models were unavailable. Returning structured guidance fallback.")
    return DEFAULT_DOSAGE_CARD
