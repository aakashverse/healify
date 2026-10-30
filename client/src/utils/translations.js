// Complete bilingual translations for Heal-U (English & Hindi)
// Specially formulated for clarity in both rural and urban contexts.

export const translations = {
  en: {
    // Brand
    brandName: 'Heal-U',
    brandTagline: 'Rural & Urban Community Health Portal',
    portalSubtitle: 'Simple, free healthcare guidance for everyone',

    // Emergency Bar
    sosBarTitle: 'EMERGENCY SOS',
    sosBarText: 'Severe chest pain, snakebite, breathing distress, or bleeding? Dial 108 immediately.',
    sosCallBtn: 'Call 108 Ambulance',
    sosFirstAidBtn: 'Quick First Aid',

    // Nav & Tabs
    navHome: 'Home',
    navChat: 'Ask Cura AI',
    navScanner: 'Rx Scanner',
    navHospitals: 'Nearby Hospitals',
    navFirstAid: 'First Aid SOS',
    langToggleBtn: 'हिन्दी में देखें',
    langCurrent: 'English',

    // Home View
    heroGreeting: 'How can we help your health today?',
    heroSubtitle: 'Choose a service below or type your symptoms. Free, private, and guided by ICMR & WHO medical standards.',
    searchPlaceholder: 'Type symptoms (e.g. fever for 2 days, loose motions, chest pain)...',
    searchBtn: 'Ask AI',

    // Quick Action Cards on Home
    card1Title: 'Talk to Doctor AI (Cura AI)',
    card1Desc: 'Describe your symptoms in simple words. Get instant safe guidance, first aid advice, and clinic recommendations.',
    card1Btn: 'Start Health Chat',

    card2Title: 'Scan Medicine Prescription',
    card2Desc: 'Take a photo of a doctor slip or medicine strip. See clearly when to take it: Morning, Afternoon, or Night.',
    card2Btn: 'Scan Prescription Photo',

    card3Title: 'Find Nearby Health Centres',
    card3Desc: 'Check nearby PHCs, CHCs, and District Hospitals. Check anti-snake venom availability and 24x7 emergency beds.',
    card3Btn: 'Find Facilities',

    card4Title: 'Emergency First Aid Protocols',
    card4Desc: 'Step-by-step life saving actions for snakebites, heart attacks, breathing difficulty, and bleeding while awaiting 108.',
    card4Btn: 'View Life-Saving Steps',

    // Emergency Helpline Grid
    helplinesTitle: 'Direct Emergency Helplines (Toll-Free 24x7)',
    helpline108Name: '108 Ambulance Dispatch',
    helpline108Sub: 'Free emergency transport',
    helpline102Name: '102 Mother & Child (Janani)',
    helpline102Sub: 'Pregnancy & newborn helpline',
    helpline112Name: '112 National Emergency',
    helpline112Sub: 'Police, Fire & Medical',
    helpline1075Name: '1075 Health Ministry',
    helpline1075Sub: 'Government health info',

    // Quick Inquiries Chips
    popularInquiries: 'Popular Common Inquiries:',
    chipFever: 'Fever & Body Chills',
    chipLooseMotion: 'Diarrhea & Vomiting (ORS)',
    chipChestPain: 'Chest Pressure (SOS Alert)',
    chipCough: 'Dry Cough & Throat Pain',
    chipPregnancy: 'Pregnancy Checkups',

    // Cura AI Chat View
    chatTitle: 'Cura AI Health Assistant',
    chatSubtitle: 'Grounded in WHO & ICMR Guidelines • Free & Private',
    chatDisclaimer: 'Notice: Cura AI provides triage advice and educational information. Always visit a doctor or PHC for a formal diagnosis.',
    chatPlaceholder: 'Write your symptom or health question here...',
    chatSendBtn: 'Send',
    chatTryPrompt: 'Try asking:',
    chatSources: 'Verified Guidelines:',
    chatListen: 'Listen Audio',
    chatSpeaking: 'Speaking...',
    chatSosAlert: 'EMERGENCY RED-FLAG TRIGGERED',
    chatSosAction: 'Please call 108 or go to the nearest emergency room immediately.',
    chatAttachFile: 'Attach prescription photo',
    chatSample1: 'I have high fever and shivering since 2 days',
    chatSample2: 'Chest pain and sweating',
    chatSample3: 'What to give a child having loose motions?',
    chatSample4: 'What is the first aid for a snake bite?',

    // Prescription Scanner View
    rxTitle: 'Prescription & Medicine Blister Scanner',
    rxSubtitle: 'Take a photo of any handwritten prescription or medicine packaging to see dosage timings clearly.',
    rxUploadTitle: 'Upload or Take Photo of Prescription',
    rxUploadSub: 'Supports JPG, PNG, WEBP or PDF files',
    rxSelectBtn: 'Select Picture from Phone/Computer',
    rxAnalyzeBtn: 'Analyze Medicine Dosages',
    rxAnalyzing: 'Reading medicine names & timings...',
    rxSampleTitle: 'Or test with preset sample prescriptions:',
    rxSample1: 'Amoxicillin Antibiotic (Bacterial)',
    rxSample2: 'Cough Relief Syrup (3x Daily)',
    rxSample3: 'Cetirizine Allergy Tablet (Night)',
    rxSample4: 'Paracetamol & ORS (Fever & Hydration)',
    rxNoData: 'No prescription selected yet. Upload a photo or click a sample on the left.',
    rxDosageReady: 'Medication Schedule Detected',
    rxMorning: 'Morning (सुबह)',
    rxAfternoon: 'Afternoon (दोपहर)',
    rxNight: 'Night (रात)',
    rxTakeDose: '1 Dose',
    rxNoDose: 'None',
    rxMealAfter: 'After Food (खाना खाने के बाद)',
    rxMealBefore: 'Before Food / Empty Stomach (खाली पेट)',
    rxMealAny: 'When Needed (जब जरूरत हो)',
    rxWarning: 'Precaution',
    rxAudioListen: 'Listen Audio Explanation',
    rxGeneralAdvice: 'General Doctor Advice',

    // Facilities Explorer View
    facTitle: 'Nearby PHC, CHC & District Hospitals',
    facSubtitle: 'Live directory showing emergency beds, anti-snake venom stock, and direct phone lines.',
    facFilterAll: 'All Centres',
    facFilterDH: 'District Hospital',
    facFilterCHC: 'CHC (Community)',
    facFilterPHC: 'PHC (Primary)',
    facSearchPlaceholder: 'Search by hospital name or village...',
    fac24x7: '24x7 Emergency Active',
    facDayOnly: 'Day OPD Hours',
    facAsv: 'Anti-Snake Venom (ASV) Stocked',
    facBloodBank: 'Blood Bank Available',
    facCallNow: 'Call Hospital',
    facCallAmbulance: 'Ambulance 108',
    facRefresh: 'Refresh List',

    // First Aid Guide View
    faTitle: 'Life-Saving Emergency First Aid Protocols',
    faSubtitle: 'Verified emergency actions to protect patients while waiting for 108 ambulance arrival.',
    faSelectPrompt: 'Choose Emergency Situation:',
    faPrincipal: 'Primary Golden Rule',
    faDosTitle: 'MUST DO (यह अवश्य करें)',
    faDontsTitle: 'DO NOT (यह गलती भूलकर न करें)',
    faAudioBtn: 'Read Out Protocol',
    faStopAudio: 'Stop Audio',
    faCall108Banner: 'In active emergency? Call 108 immediately.',

    // Footer
    footerDisclaimer: 'Medical Notice: Heal-U and Cura AI provide health triage and educational guidance based on official WHO & ICMR protocols. It is not a clinical medical diagnosis. For severe illness or emergencies, always visit your nearest Primary Health Centre or dial 108 immediately.',
    footerCredits: 'Designed with care for both rural and urban citizens.',
    footerEmergency: 'Toll-Free Helplines: 108 (Ambulance) • 102 (Mother & Child) • 112 (National Emergency)'
  },

  hi: {
    // Brand
    brandName: 'हील-यू (Heal-U)',
    brandTagline: 'ग्रामीण एवं शहरी स्वास्थ्य सहायता पोर्टल',
    portalSubtitle: 'हर नागरिक के लिए सरल, निःशुल्क स्वास्थ्य मार्गदर्शन',

    // Emergency Bar
    sosBarTitle: 'आपातकालीन सहायता (SOS)',
    sosBarText: 'सीने में तेज दर्द, सांप का काटना, सांस फूलना या भारी खून बहना? तुरंत 108 पर कॉल करें।',
    sosCallBtn: '108 एम्बुलेंस बुलाएं',
    sosFirstAidBtn: 'प्राथमिक उपचार देखें',

    // Nav & Tabs
    navHome: 'मुख्य पृष्ठ (होम)',
    navChat: 'डॉक्टर AI से पूछें',
    navScanner: 'पर्ची स्कैनर',
    navHospitals: 'नजदीकी अस्पताल',
    navFirstAid: 'प्राथमिक उपचार (SOS)',
    langToggleBtn: 'View in English',
    langCurrent: 'हिन्दी',

    // Home View
    heroGreeting: 'आज आपकी सेहत में हम क्या मदद कर सकते हैं?',
    heroSubtitle: 'नीचे दी गई किसी भी सेवा पर क्लिक करें या अपने लक्षण लिखें। यह पूरी तरह निःशुल्क और ICMR व WHO मानकों पर आधारित है।',
    searchPlaceholder: 'लक्षण लिखें (जैसे: 2 दिन से तेज बुखार, दस्त, सीने में दर्द)...',
    searchBtn: 'AI से पूछें',

    // Quick Action Cards on Home
    card1Title: 'डॉक्टर AI (Cura AI) से बात करें',
    card1Desc: 'अपनी बीमारी के लक्षण सरल भाषा में बताएं। तुरंत सुरक्षित सलाह, प्राथमिक उपचार और डॉक्टर के पास जाने की जानकारी पाएं।',
    card1Btn: 'स्वास्थ्य चैट शुरू करें',

    card2Title: 'दवा की पर्ची (Prescription) स्कैन करें',
    card2Desc: 'डॉक्टर की पर्ची या दवा के पत्ते का फोटो खींचें। साफ देखें कि दवा कब खानी है: सुबह, दोपहर या रात को।',
    card2Btn: 'पर्ची का फोटो जांचें',

    card3Title: 'नजदीकी अस्पताल व PHC खोजें',
    card3Desc: 'नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC), CHC और जिला अस्पताल देखें। सांप के जहर की दवा (Anti-Venom) व 24 घंटे आपातकालीन सेवा की जांच करें।',
    card3Btn: 'अस्पताल सूची देखें',

    card4Title: 'आपातकालीन प्राथमिक उपचार (First Aid)',
    card4Desc: 'सांप काटने, दिल का दौरा, सांस फूलने और खून बहने पर एम्बुलेंस 108 आने तक जान बचाने के जरूरी कदम।',
    card4Btn: 'प्राथमिक उपचार के नियम',

    // Emergency Helpline Grid
    helplinesTitle: 'सीधे आपातकालीन हेल्पलाइन नंबर (24 घंटे निःशुल्क)',
    helpline108Name: '108 एम्बुलेंस सेवा',
    helpline108Sub: 'आपातकालीन निःशुल्क वाहन',
    helpline102Name: '102 जननी सुरक्षा एम्बुलेंस',
    helpline102Sub: 'गर्भवती महिलाओं व नवजात के लिए',
    helpline112Name: '112 राष्ट्रीय आपातकालीन नंबर',
    helpline112Sub: 'पुलिस, दमकल व मेडिकल सहायता',
    helpline1075Name: '1075 स्वास्थ्य मंत्रालय हेल्पलाइन',
    helpline1075Sub: 'सरकारी स्वास्थ्य परामर्श व जानकारी',

    // Quick Inquiries Chips
    popularInquiries: 'अक्सर पूछे जाने वाले सवाल:',
    chipFever: 'बुखार और बदन दर्द',
    chipLooseMotion: 'उल्टी और दस्त (ORS घोल)',
    chipChestPain: 'सीने में दर्द (आपातकाल)',
    chipCough: 'खांसी और गले में खराश',
    chipPregnancy: 'गर्भावस्था जांच व टीकाकरण',

    // Cura AI Chat View
    chatTitle: 'क्यूरा AI (Cura AI) स्वास्थ्य सहायक',
    chatSubtitle: 'WHO एवं ICMR दिशानिर्देशों पर आधारित • सुरक्षित व निःशुल्क',
    chatDisclaimer: 'महत्वपूर्ण सूचना: क्यूरा AI प्राथमिक मार्गदर्शन देता है। किसी भी गंभीर बीमारी के लिए तुरंत PHC जाकर डॉक्टर को दिखाएं।',
    chatPlaceholder: 'अपनी परेशानी या बीमारी के लक्षण यहां लिखें...',
    chatSendBtn: 'भेजें',
    chatTryPrompt: 'यह सवाल पूछकर देखें:',
    chatSources: 'प्रमाणित दिशानिर्देश:',
    chatListen: 'आवाज में सुनें',
    chatSpeaking: 'बोल रहा है...',
    chatSosAlert: 'आपातकालीन चेतावनी (EMERGENCY)',
    chatSosAction: 'कृपया तुरंत 108 पर कॉल करें या नजदीकी अस्पताल जाएं।',
    chatAttachFile: 'पर्ची की फोटो जोड़ें',
    chatSample1: 'मुझे 2 दिन से तेज बुखार और कंपकंपी है',
    chatSample2: 'सीने में भारीपन और पसीना आ रहा है',
    chatSample3: 'बच्चे को उल्टी-दस्त हो रहे हैं, क्या करें?',
    chatSample4: 'सांप काटने पर तुरंत क्या करना चाहिए?',

    // Prescription Scanner View
    rxTitle: 'दवा पर्ची व पत्ता स्कैनर (Rx Scanner)',
    rxSubtitle: 'डॉक्टर की हाथ से लिखी पर्ची या दवा के पत्ते का फोटो खींचें और खाने का समय आसानी से समझें।',
    rxUploadTitle: 'पर्ची का फोटो अपलोड करें या खींचें',
    rxUploadSub: 'JPG, PNG, WEBP या PDF फाइल लगा सकते हैं',
    rxSelectBtn: 'फोन या कंप्यूटर से फोटो चुनें',
    rxAnalyzeBtn: 'दवा के समय की जांच करें',
    rxAnalyzing: 'दवा का नाम और खाने का समय पढ़ा जा रहा है...',
    rxSampleTitle: 'या इन उदाहरण पर्चियों से जांच करके देखें:',
    rxSample1: 'एमोक्सिसिलिन एंटीबायोटिक (Amoxicillin)',
    rxSample2: 'खांसी का सिरप (दिन में 3 बार)',
    rxSample3: 'सिट्रीजीन एलर्जी की गोली (रात को)',
    rxSample4: 'पैरासिटामोल व ORS (बुखार व पानी की कमी)',
    rxNoData: 'अभी कोई पर्ची नहीं चुनी गई है। फोटो अपलोड करें या बाईं तरफ दिए गए उदाहरण पर क्लिक करें।',
    rxDosageReady: 'दवा खाने का समय तैयार है',
    rxMorning: 'सुबह (Morning)',
    rxAfternoon: 'दोपहर (Afternoon)',
    rxNight: 'रात (Night)',
    rxTakeDose: '1 खुराक लें',
    rxNoDose: 'नहीं लेना',
    rxMealAfter: 'खाना खाने के बाद',
    rxMealBefore: 'खाली पेट',
    rxMealAny: 'जरूरत पड़ने पर',
    rxWarning: 'सावधानी व परहेज',
    rxAudioListen: 'निर्देश आवाज में सुनें',
    rxGeneralAdvice: 'डॉक्टर की सामान्य सलाह',

    // Facilities Explorer View
    facTitle: 'नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) व अस्पताल',
    facSubtitle: 'सांप के जहर की दवा (Anti-Venom), 24 घंटे आपातकालीन सेवा और फोन नंबर की जानकारी।',
    facFilterAll: 'सभी केंद्र',
    facFilterDH: 'जिला अस्पताल',
    facFilterCHC: 'सामुदायिक केंद्र (CHC)',
    facFilterPHC: 'प्राथमिक केंद्र (PHC)',
    facSearchPlaceholder: 'अस्पताल के नाम या गांव से खोजें...',
    fac24x7: '24 घंटे आपातकालीन सेवा चालू',
    facDayOnly: 'केवल दिन की ओपीडी (OPD)',
    facAsv: 'सांप के जहर की दवा (Anti-Venom) उपलब्ध',
    facBloodBank: 'ब्लड बैंक की सुविधा उपलब्ध',
    facCallNow: 'अस्पताल को फोन करें',
    facCallAmbulance: '108 एम्बुलेंस बुलाएं',
    facRefresh: 'ताजा जानकारी देखें',

    // First Aid Guide View
    faTitle: 'जान बचाने वाले प्राथमिक उपचार (First Aid Protocols)',
    faSubtitle: '108 एम्बुलेंस आने तक मरीज की जान बचाने के लिए क्या करें और क्या न करें।',
    faSelectPrompt: 'आपातकालीन स्थिति चुनें:',
    faPrincipal: 'सबसे जरूरी नियम (गोल्डन रूल)',
    faDosTitle: 'यह अवश्य करें (DO THIS)',
    faDontsTitle: 'यह गलती भूलकर न करें (DO NOT)',
    faAudioBtn: 'नियम आवाज में सुनें',
    faStopAudio: 'आवाज रोकें',
    faCall108Banner: 'यदि गंभीर आपातकाल है तो तुरंत 108 पर कॉल करें।',

    // Footer
    footerDisclaimer: 'चिकित्सा सूचना: हील-यू (Heal-U) और क्यूरा AI केवल प्राथमिक स्वास्थ्य जानकारी व मार्गदर्शन प्रदान करते हैं। यह डॉक्टर की औपचारिक जांच का विकल्प नहीं है। गंभीर बीमारी या आपातकाल में तुरंत अपने नजदीकी अस्पताल जाएं या 108 पर कॉल करें।',
    footerCredits: 'ग्रामीण और शहरी दोनों नागरिकों की सुविधा के लिए समर्पित।',
    footerEmergency: 'निःशुल्क हेल्पलाइन: 108 (एम्बुलेंस) • 102 (मातृ एवं शिशु स्वास्थ्य) • 112 (राष्ट्रीय आपातकाल)'
  }
};
