import { detectUserLanguagePreference, INDIAN_LANGUAGES, type IndianLanguageCode } from './tools/multilingual-enhanced';
import { searchMemoriesEnhanced } from './memory-actions-enhanced';
import { getCurrentUser } from './auth';

/**
 * 🕉️ Guru Multilingual System - Divine Communication in Mother Tongues 🕉️
 * 
 * विद्या ददाति विनयं - Knowledge bestows humility
 * 
 * This sacred module enables the Guru to manifest in all Bharatiya languages,
 * creating a divine bridge between ancient wisdom and modern learning.
 */

// 🔱 Divine Linguistic Mantras - Sacred phrases for each mother tongue
const SOCRATIC_PHRASES: Record<IndianLanguageCode, {
  greeting: string;
  thinkingPrompt: string[];
  encouragement: string[];
  clarification: string[];
}> = {
  hi: {
    greeting: "नमस्ते! मैं आपका विवेक गुरु हूं। आज हम क्या सीखेंगे?",
    thinkingPrompt: [
      "यह एक अच्छा प्रश्न है! आइए सोचें...",
      "बहुत रोचक! मुझे लगता है कि...",
      "चलिए इसे समझने की कोशिश करते हैं..."
    ],
    encouragement: [
      "बहुत अच्छा प्रयास!",
      "आप सही दिशा में सोच रहे हैं।",
      "शाबाश! आपकी सोच बिल्कुल सही है।"
    ],
    clarification: [
      "क्या आप इसके बारे में थोड़ा और बता सकते हैं?",
      "आपका क्या मतलब है? कृपया स्पष्ट करें।",
      "क्या आप एक उदाहरण दे सकते हैं?"
    ]
  },
  ta: {
    greeting: "வணக்கம்! நான் உங்கள் விவேக குரு. இன்று நாம் என்ன கற்றுக்கொள்வோம்?",
    thinkingPrompt: [
      "இது ஒரு நல்ல கேள்வி! சிந்திப்போம்...",
      "மிகவும் சுவாரஸ்யமானது! நான் நினைக்கிறேன்...",
      "இதை புரிந்து கொள்ள முயற்சிப்போம்..."
    ],
    encouragement: [
      "மிகவும் நல்ல முயற்சி!",
      "நீங்கள் சரியான திசையில் சிந்திக்கிறீர்கள்.",
      "பாராட்டுகள்! உங்கள் சிந்தனை சரியானது."
    ],
    clarification: [
      "இதைப் பற்றி மேலும் விளக்க முடியுமா?",
      "நீங்கள் என்ன சொல்கிறீர்கள்? தயவுசெய்து விளக்குங்கள்.",
      "ஒரு உதாரணம் தர முடியுமா?"
    ]
  },
  bn: {
    greeting: "নমস্কার! আমি আপনার বিবেক গুরু। আজ আমরা কী শিখব?",
    thinkingPrompt: [
      "এটি একটি ভাল প্রশ্ন! চলুন ভাবি...",
      "খুব আকর্ষণীয়! আমার মনে হয়...",
      "চলুন এটি বোঝার চেষ্টা করি..."
    ],
    encouragement: [
      "খুব ভাল প্রচেষ্টা!",
      "আপনি সঠিক দিকে ভাবছেন।",
      "অভিনন্দন! আপনার চিন্তাভাবনা একদম ঠিক।"
    ],
    clarification: [
      "আপনি কি এ সম্পর্কে আরও বলতে পারেন?",
      "আপনি কী বলতে চাইছেন? দয়া করে স্পষ্ট করুন।",
      "আপনি কি একটি উদাহরণ দিতে পারেন?"
    ]
  },
  mr: {
    greeting: "नमस्कार! मी तुमचा विवेक गुरु आहे. आज आपण काय शिकू?",
    thinkingPrompt: [
      "हा एक चांगला प्रश्न आहे! चला विचार करूया...",
      "खूप मनोरंजक! मला वाटते...",
      "चला हे समजून घेण्याचा प्रयत्न करूया..."
    ],
    encouragement: [
      "खूप चांगला प्रयत्न!",
      "तुम्ही योग्य दिशेने विचार करत आहात.",
      "शाब्बास! तुमचा विचार अगदी योग्य आहे."
    ],
    clarification: [
      "तुम्ही याबद्दल अधिक सांगू शकता का?",
      "तुम्हाला काय म्हणायचे आहे? कृपया स्पष्ट करा.",
      "तुम्ही एक उदाहरण देऊ शकता का?"
    ]
  },
  te: {
    greeting: "నమస్కారం! నేను మీ వివేక గురువు. ఈరోజు మనం ఏమి నేర్చుకుందాం?",
    thinkingPrompt: [
      "ఇది మంచి ప్రశ్న! ఆలోచిద్దాం...",
      "చాలా ఆసక్తికరం! నాకు అనిపిస్తుంది...",
      "దీన్ని అర్థం చేసుకోవడానికి ప్రయత్నిద్దాం..."
    ],
    encouragement: [
      "చాలా మంచి ప్రయత్నం!",
      "మీరు సరైన దిశలో ఆలోచిస్తున్నారు.",
      "అభినందనలు! మీ ఆలోచన సరైనది."
    ],
    clarification: [
      "దీని గురించి మరింత చెప్పగలరా?",
      "మీరు ఏమి అంటున్నారు? దయచేసి వివరించండి.",
      "మీరు ఒక ఉదాహరణ ఇవ్వగలరా?"
    ]
  },
  gu: {
    greeting: "નમસ્તે! હું તમારો વિવેક ગુરુ છું. આજે આપણે શું શીખીશું?",
    thinkingPrompt: [
      "આ એક સારો પ્રશ્ન છે! ચાલો વિચારીએ...",
      "ખૂબ રસપ્રદ! મને લાગે છે...",
      "ચાલો આને સમજવાનો પ્રયાસ કરીએ..."
    ],
    encouragement: [
      "ખૂબ સારો પ્રયાસ!",
      "તમે યોગ્ય દિશામાં વિચારી રહ્યા છો.",
      "શાબાશ! તમારો વિચાર બિલકુલ સાચો છે."
    ],
    clarification: [
      "શું તમે આ વિશે વધુ કહી શકો છો?",
      "તમારો અર્થ શું છે? કૃપા કરીને સ્પષ્ટ કરો.",
      "શું તમે એક ઉદાહરણ આપી શકો છો?"
    ]
  },
  kn: {
    greeting: "ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮ ವಿವೇಕ ಗುರು. ಇಂದು ನಾವು ಏನು ಕಲಿಯೋಣ?",
    thinkingPrompt: [
      "ಇದು ಒಳ್ಳೆಯ ಪ್ರಶ್ನೆ! ಯೋಚಿಸೋಣ...",
      "ತುಂಬಾ ಆಸಕ್ತಿದಾಯಕ! ನನಗೆ ಅನಿಸುತ್ತದೆ...",
      "ಇದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ಪ್ರಯತ್ನಿಸೋಣ..."
    ],
    encouragement: [
      "ತುಂಬಾ ಒಳ್ಳೆಯ ಪ್ರಯತ್ನ!",
      "ನೀವು ಸರಿಯಾದ ದಿಕ್ಕಿನಲ್ಲಿ ಯೋಚಿಸುತ್ತಿದ್ದೀರಿ.",
      "ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಆಲೋಚನೆ ಸರಿಯಾಗಿದೆ."
    ],
    clarification: [
      "ನೀವು ಇದರ ಬಗ್ಗೆ ಇನ್ನಷ್ಟು ಹೇಳಬಹುದೇ?",
      "ನಿಮ್ಮ ಅರ್ಥವೇನು? ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟಪಡಿಸಿ.",
      "ನೀವು ಒಂದು ಉದಾಹರಣೆ ನೀಡಬಹುದೇ?"
    ]
  },
  ml: {
    greeting: "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ വിവേക ഗുരു. ഇന്ന് നമുക്ക് എന്ത് പഠിക്കാം?",
    thinkingPrompt: [
      "ഇത് ഒരു നല്ല ചോദ്യമാണ്! ചിന്തിക്കാം...",
      "വളരെ രസകരം! എനിക്ക് തോന്നുന്നു...",
      "ഇത് മനസ്സിലാക്കാൻ ശ്രമിക്കാം..."
    ],
    encouragement: [
      "വളരെ നല്ല ശ്രമം!",
      "നിങ്ങൾ ശരിയായ ദിശയിൽ ചിന്തിക്കുന്നു.",
      "അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ ചിന്ത ശരിയാണ്."
    ],
    clarification: [
      "നിങ്ങൾക്ക് ഇതിനെക്കുറിച്ച് കൂടുതൽ പറയാമോ?",
      "നിങ്ങളുടെ അർത്ഥം എന്താണ്? ദയവായി വ്യക്തമാക്കുക.",
      "നിങ്ങൾക്ക് ഒരു ഉദാഹരണം നൽകാമോ?"
    ]
  },
  pa: {
    greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਵਿਵੇਕ ਗੁਰੂ ਹਾਂ। ਅੱਜ ਅਸੀਂ ਕੀ ਸਿੱਖਾਂਗੇ?",
    thinkingPrompt: [
      "ਇਹ ਇੱਕ ਚੰਗਾ ਸਵਾਲ ਹੈ! ਆਓ ਸੋਚੀਏ...",
      "ਬਹੁਤ ਦਿਲਚਸਪ! ਮੈਨੂੰ ਲੱਗਦਾ ਹੈ...",
      "ਆਓ ਇਸਨੂੰ ਸਮਝਣ ਦੀ ਕੋਸ਼ਿਸ਼ ਕਰੀਏ..."
    ],
    encouragement: [
      "ਬਹੁਤ ਵਧੀਆ ਕੋਸ਼ਿਸ਼!",
      "ਤੁਸੀਂ ਸਹੀ ਦਿਸ਼ਾ ਵਿੱਚ ਸੋਚ ਰਹੇ ਹੋ।",
      "ਸ਼ਾਬਾਸ਼! ਤੁਹਾਡੀ ਸੋਚ ਬਿਲਕੁਲ ਸਹੀ ਹੈ।"
    ],
    clarification: [
      "ਕੀ ਤੁਸੀਂ ਇਸ ਬਾਰੇ ਹੋਰ ਦੱਸ ਸਕਦੇ ਹੋ?",
      "ਤੁਹਾਡਾ ਕੀ ਮਤਲਬ ਹੈ? ਕਿਰਪਾ ਕਰਕੇ ਸਪੱਸ਼ਟ ਕਰੋ।",
      "ਕੀ ਤੁਸੀਂ ਇੱਕ ਉਦਾਹਰਣ ਦੇ ਸਕਦੇ ਹੋ?"
    ]
  },
  or: {
    greeting: "ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କର ବିବେକ ଗୁରୁ। ଆଜି ଆମେ କଣ ଶିଖିବା?",
    thinkingPrompt: [
      "ଏହା ଏକ ଭଲ ପ୍ରଶ୍ନ! ଚାଲନ୍ତୁ ଭାବିବା...",
      "ବହୁତ ରୋଚକ! ମୋର ମନେ ହୁଏ...",
      "ଚାଲନ୍ତୁ ଏହାକୁ ବୁଝିବାକୁ ଚେଷ୍ଟା କରିବା..."
    ],
    encouragement: [
      "ବହୁତ ଭଲ ପ୍ରୟାସ!",
      "ଆପଣ ସଠିକ୍ ଦିଗରେ ଭାବୁଛନ୍ତି।",
      "ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ଚିନ୍ତା ସଠିକ୍।"
    ],
    clarification: [
      "ଆପଣ ଏ ବିଷୟରେ ଅଧିକ କହିପାରିବେ କି?",
      "ଆପଣଙ୍କର ଅର୍ଥ କଣ? ଦୟାକରି ସ୍ପଷ୍ଟ କରନ୍ତୁ।",
      "ଆପଣ ଗୋଟିଏ ଉଦାହରଣ ଦେଇପାରିବେ କି?"
    ]
  },
  en: {
    greeting: "Hello! I am your Vivek Guru. What shall we learn today?",
    thinkingPrompt: [
      "That's a good question! Let's think...",
      "Very interesting! I think...",
      "Let's try to understand this..."
    ],
    encouragement: [
      "Very good attempt!",
      "You're thinking in the right direction.",
      "Well done! Your thinking is correct."
    ],
    clarification: [
      "Can you tell me more about this?",
      "What do you mean? Please clarify.",
      "Can you give an example?"
    ]
  }
};

/**
 * 🌺 Detects the sacred tongue of the seeker
 * Returns divine phrases aligned with their linguistic consciousness
 */
export async function detectStudentLanguage(messages: any[]): Promise<{
  language: IndianLanguageCode;
  languageName: string;
  phrases: typeof SOCRATIC_PHRASES[IndianLanguageCode];
}> {
  const language = await detectUserLanguagePreference(messages);
  
  return {
    language,
    languageName: INDIAN_LANGUAGES[language],
    phrases: SOCRATIC_PHRASES[language]
  };
}

/**
 * 🪔 Illuminates the Guru's consciousness with multilingual wisdom
 * Transforms system prompts into sacred teaching mantras
 */
export function getMultilingualGuruPrompt(language: IndianLanguageCode, studentContext?: string): string {
  const languageName = INDIAN_LANGUAGES[language];
  const phrases = SOCRATIC_PHRASES[language];
  
  return `# 🔱 MULTILINGUAL GURU PROTOCOL 🔱

You are Vivek, a wise and patient Guru who communicates fluently in ${languageName}. 

## LANGUAGE PROTOCOL:
- You MUST respond entirely in ${languageName} (language code: ${language})
- Use natural, conversational ${languageName} that a student would understand
- Include appropriate cultural references and examples from Indian context
- Use these phrases naturally in your responses:
  - Greeting: "${phrases.greeting}"
  - When thinking: ${phrases.thinkingPrompt.map(p => `"${p}"`).join(', ')}
  - For encouragement: ${phrases.encouragement.map(p => `"${p}"`).join(', ')}
  - For clarification: ${phrases.clarification.map(p => `"${p}"`).join(', ')}

## CORE DHARMA (NON-NEGOTIABLE):
1. NEVER give direct answers to subject questions - always guide through questions
2. Use the Socratic method adapted to Indian educational context
3. Break complex concepts into simple, relatable parts
4. Use examples from daily Indian life (cricket, festivals, food, family)
5. Be patient and encouraging, especially when students struggle

${studentContext ? `## STUDENT CONTEXT:\n${studentContext}` : ''}

Remember: You are not just translating English responses. You are thinking and teaching natively in ${languageName}, with all the cultural wisdom and pedagogical approaches natural to that language.`;
}

/**
 * 📝 Stores the sacred linguistic preference in eternal memory
 * Records the chosen tongue for future divine interactions
 */
export async function storeLanguagePreference(userId: string, language: IndianLanguageCode): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  
  // Store language preference as a memory
  await fetch('/api/memory-enhanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'add',
      content: `Student prefers to communicate in ${INDIAN_LANGUAGES[language]}`,
      metadata: {
        type: 'profile',
        topic: 'language_preference',
        language: language,
        importance: 10
      }
    })
  });
}

/**
 * 🔎 Retrieves the seeker's linguistic inclination from Akashic records
 * Recalls their preferred mode of divine communication
 */
export async function getStoredLanguagePreference(userId: string): Promise<IndianLanguageCode | null> {
  const memories = await searchMemoriesEnhanced({
    query: 'language preference communication',
    filters: {
      type: 'profile',
      topic: 'language_preference'
    },
    limit: 1
  });
  
  if (memories.length > 0 && memories[0].metadata?.language) {
    return memories[0].metadata.language as IndianLanguageCode;
  }
  
  return null;
}

/**
 * 🌸 Sacred Socratic Dialogues - Wisdom in Many Tongues
 * Examples of divine questioning across linguistic realms
 */
export const MULTILINGUAL_EXAMPLES = {
  physics_light: {
    hi: {
      question: "आकाश नीला क्यों दिखता है?",
      response: "वाह! यह तो बहुत ही मज़ेदार सवाल है! 🌞 चलिए सोचते हैं... क्या आपने कभी देखा है कि सूरज की रोशनी का रंग कैसा होता है? और क्या आपने कभी प्रिज़्म से गुज़रती रोशनी देखी है?"
    },
    ta: {
      question: "வானம் ஏன் நீல நிறமாக தெரிகிறது?",
      response: "அருமை! இது மிகவும் சுவாரஸ்யமான கேள்வி! 🌞 சிந்திப்போம்... நீங்கள் எப்போதாவது சூரிய ஒளியின் நிறம் எப்படி இருக்கும் என்று பார்த்திருக்கிறீர்களா? ப்ரிஸம் வழியாக செல்லும் ஒளியை பார்த்திருக்கிறீர்களா?"
    }
  },
  math_fractions: {
    hi: {
      question: "1/2 + 1/4 कैसे जोड़ें?",
      response: "अच्छा सवाल! 🍕 चलिए इसे पिज़्ज़ा से समझते हैं। अगर आपके पास आधा पिज़्ज़ा है और आपका दोस्त आपको चौथाई पिज़्ज़ा और देता है, तो सोचिए - क्या हम इन्हें सीधे जोड़ सकते हैं? या पहले कुछ और करना होगा?"
    },
    bn: {
      question: "1/2 + 1/4 কিভাবে যোগ করব?",
      response: "ভাল প্রশ্ন! 🍕 চলুন এটি পিৎজা দিয়ে বুঝি। যদি আপনার কাছে অর্ধেক পিৎজা থাকে এবং আপনার বন্ধু আপনাকে আরও এক-চতুর্থাংশ পিৎজা দেয়, তাহলে ভাবুন - আমরা কি এগুলি সরাসরি যোগ করতে পারি? নাকি প্রথমে কিছু করতে হবে?"
    }
  }
};

/**
 * Generates a culturally relevant example based on language and topic
 */
export function getCulturalExample(language: IndianLanguageCode, topic: string): string {
  // This would be expanded with a rich database of cultural examples
  const examples: Record<string, Record<IndianLanguageCode, string>> = {
    'measurement': {
      hi: 'जैसे हम चाय में चीनी चम्मच से नापते हैं',
      ta: 'தேநீரில் சர்க்கரையை ஸ்பூனால் அளப்பது போல',
      bn: 'যেমন আমরা চায়ে চিনি চামচ দিয়ে মাপি',
      en: 'Like measuring sugar in tea with spoons'
    },
    'speed': {
      hi: 'जैसे क्रिकेट में गेंद की रफ़्तार',
      ta: 'கிரிக்கெட்டில் பந்தின் வேகம் போல',
      bn: 'ক্রিকেটে বলের গতির মতো',
      en: 'Like the speed of a cricket ball'
    }
  };
  
  return examples[topic]?.[language] || examples[topic]?.['en'] || '';
}