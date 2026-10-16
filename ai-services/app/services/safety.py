# emergency red flag keywords in english and hindi
RED_FLAGS = {
    "cardiac":   ["chest pain", "seene mein dard", "सीने में दर्द", "heart attack", "दिल का दौरा", "chest pressure", "chhathi me dard"],
    "breathing": ["can't breathe", "cannot breathe", "saans nahi", "सांस नहीं", "सांस फूल", "difficulty breathing", "दम घुट"],
    "bleeding":  ["heavy bleeding", "bahut khoon", "खून बहुत", "रक्तस्राव", "severe bleeding", "khoon beh raha"],
    "snakebite": ["snake", "saanp", "सांप", "साँप", "snake bite", "saanp ne kata"],
    "maternal":  ["pregnant", "garbhwati", "गर्भवती", "प्रसव", "delivery pain", "garbh me dard", "water broke"],
}

# immediate life-saving first-aid guidelines
FIRST_AID = {
    "snakebite": {
        "en": "Keep the person completely calm and still. Do NOT cut the wound or suck the venom. Immobilize the limb and rush to the nearest PHC/hospital immediately for anti-venom.",
        "hi": "मरीज को बिल्कुल शांत और स्थिर रखें, हिलने न दें। घाव पर चीरा न लगाएं और न ही जहर चूसें। अंग को सहारा दें और तुरंत 108 बुलाकर नजदीकी अस्पताल ले जाएं।"
    },
    "cardiac": {
        "en": "Have the person sit down and rest immediately. Loosen tight collar or clothes. Keep calm, dial 108, and transport to the emergency room immediately.",
        "hi": "मरीज को तुरंत आराम से बैठा दें। कपड़े ढीले करें और शांत रखें। बिना देरी किए 108 पर कॉल करें और तुरंत नजदीकी अस्पताल ले जाएं।"
    },
    "breathing": {
        "en": "Sit the person upright in an open, airy spot. Loosen tight clothing around neck and chest. Call 108 ambulance immediately.",
        "hi": "मरीज को खुली और हवादार जगह पर सीधा बैठाएं। गले और छाती के कपड़े ढीले करें। तुरंत 108 एम्बुलेंस को कॉल करें।"
    },
    "bleeding": {
        "en": "Press firmly on the wound with a clean cloth or bandage. Do not lift the cloth if soaked, add another layer on top. Seek emergency medical care immediately.",
        "hi": "साफ कपड़े से घाव को कसकर दबाएं रखें। यदि कपड़ा भीग जाए तो उसे हटाएं नहीं बल्कि ऊपर और कपड़ा लगाएं। तुरंत अस्पताल ले जाएं।"
    },
    "maternal": {
        "en": "Lay the woman on her left side with knees bent. Do not give food or drink. Call 108 or transport urgently to the nearest CHC or district hospital.",
        "hi": "गर्भवती महिला को बाईं करवट पर लिटाएं। कुछ भी खाने-पीने को न दें। तुरंत 108 पर कॉल करें या नजदीकी CHC/अस्पताल ले जाएं।"
    }
}

# detects user's input contains any emergency red flag symptoms - {keyword searching se}
def check_red_flag(text: str):
    t = text.lower()
    for category, words in RED_FLAGS.items():
        if any(w in t for w in words):
            return category
    return None

# returns first-aid instructions based on language
def get_first_aid(category: str, is_hindi: bool = False):
    info = FIRST_AID.get(category, {
        "en": "Please seek emergency medical attention immediately at your nearest health center.",
        "hi": "कृपया तुरंत अपने नजदीकी स्वास्थ्य केंद्र या अस्पताल में आपातकालीन सहायता लें।"
    })
    return info["hi"] if is_hindi else info["en"]