import { NextRequest, NextResponse } from 'next/server';
import { getLanguageName } from '@/constants/ai-session';
import { getVapiVoice } from '@/constants/vapi-voices';

import { CreateAssistantRequest, CreateAssistantResponse } from '@/types/vapi';

export async function POST(request: NextRequest) {
  try {
    const { language, nativeLanguage, topic }: CreateAssistantRequest =
      await request.json();

    if (!language || !nativeLanguage || !topic) {
      return NextResponse.json(
        {
          error: 'Missing required parameters: language, nativeLanguage, topic',
        },
        { status: 400 }
      );
    }

    // Get voice configuration for the native language
    const voiceConfig = getVapiVoice(nativeLanguage);
    console.log('voiceConfig', voiceConfig);

    // Generate first message in native language
    const getFirstMessage = (nativeLang: string, topic: string) => {
      const messages = {
        en: `Hello! How are you today? I'm Sofia, your English tutor. Welcome to our lesson on ${topic}!`,
        es: `¡Hola! ¿Cómo estás hoy? Soy Sofia, tu tutora de español. ¡Bienvenida a nuestra lección sobre ${topic}!`,
        fr: `Bonjour! Comment allez-vous aujourd'hui? Je suis Sofia, votre tutrice de français. Bienvenue à notre leçon sur ${topic}!`,
        de: `Hallo! Wie geht es dir heute? Ich bin Sofia, deine Deutschlehrerin. Willkommen zu unserer Lektion über ${topic}!`,
        it: `Ciao! Come stai oggi? Sono Sofia, la tua tutor di italiano. Benvenuta alla nostra lezione su ${topic}!`,
        pt: `Olá! Como você está hoje? Eu sou Sofia, sua tutora de português. Bem-vinda à nossa lição sobre ${topic}!`,
        ja: `こんにちは！今日はどうですか？私はソフィア、あなたの日本語の家庭教師です。${topic}についてのレッスンへようこそ！`,
        ko: `안녕하세요! 오늘은 어떠세요? 저는 소피아, 당신의 한국어 선생님입니다. ${topic}에 대한 수업에 오신 것을 환영합니다!`,
        zh: `你好！你今天怎么样？我是Sofia，你的中文老师。欢迎来到我们关于${topic}的课程！`,
        hi: `नमस्ते! आज आप कैसे हैं? मैं सोफिया हूं, आपकी हिंदी शिक्षिका। ${topic} पर हमारे पाठ में आपका स्वागत है!`,
        ar: `مرحبا! كيف حالك اليوم؟ أنا صوفيا، معلمتك للعربية. أهلاً بك في درسنا حول ${topic}!`,
        ru: `Привет! Как дела сегодня? Я София, ваш преподаватель русского языка. Добро пожаловать на наш урок о ${topic}!`,
        nl: `Hallo! Hoe gaat het vandaag? Ik ben Sofia, je Nederlandse lerares. Welkom bij onze les over ${topic}!`,
        pl: `Cześć! Jak się masz dzisiaj? Jestem Sofia, twoja nauczycielka polskiego. Witamy na naszej lekcji o ${topic}!`,
        tr: `Merhaba! Bugün nasılsınız? Ben Sofia, Türkçe öğretmeninizim. ${topic} hakkındaki dersimize hoş geldiniz!`,
        sv: `Hej! Hur mår du idag? Jag är Sofia, din svenska lärare. Välkommen till vår lektion om ${topic}!`,
        no: `Hei! Hvordan har du det i dag? Jeg er Sofia, din norske lærer. Velkommen til vår leksjon om ${topic}!`,
        da: `Hej! Hvordan har du det i dag? Jeg er Sofia, din danske lærer. Velkommen til vores lektion om ${topic}!`,
        fi: `Hei! Miten menee tänään? Olen Sofia, sinun suomen kielen opettajasi. Tervetuloa oppitunnillemme aiheesta ${topic}!`,
        bg: `Здравей! Как си днес? Аз съм София, твоята българска учителка. Добре дошли в нашия урок за ${topic}!`,
        ro: `Salut! Cum ești astăzi? Sunt Sofia, profesoara ta de română. Bine ai venit la lecția noastră despre ${topic}!`,
        cs: `Ahoj! Jak se máš dnes? Jsem Sofia, tvoje česká učitelka. Vítej v naší lekci o ${topic}!`,
        hu: `Helló! Hogy vagy ma? Sofia vagyok, a magyar tanárod. Üdvözöllek a leckénkben a ${topic} témában!`,
        hr: `Bok! Kako si danas? Ja sam Sofia, tvoja hrvatska učiteljica. Dobrodošao u našu lekciju o ${topic}!`,
        sk: `Ahoj! Ako sa máš dnes? Som Sofia, tvoja slovenská učiteľka. Vitaj v našej lekcii o ${topic}!`,
        el: `Γεια σου! Πώς είσαι σήμερα; Είμαι η Σοφία, η δασκάλα σου στα ελληνικά. Καλώς ήρθες στο μάθημά μας για ${topic}!`,
        ta: `வணக்கம்! இன்று எப்படி இருக்கிறீர்கள்? நான் சோபியா, உங்கள் தமிழ் ஆசிரியை. ${topic} பற்றிய எங்கள் பாடத்திற்கு வரவேற்கிறோம்!`,
        uk: `Привіт! Як справи сьогодні? Я Софія, твій викладач української мови. Ласкаво просимо на наш урок про ${topic}!`,
        vi: `Xin chào! Hôm nay bạn thế nào? Tôi là Sofia, giáo viên tiếng Việt của bạn. Chào mừng đến với bài học của chúng ta về ${topic}!`,
        th: `สวัสดี! วันนี้เป็นอย่างไรบ้าง? ฉันคือโซเฟีย ครูสอนภาษาไทยของคุณ ยินดีต้อนรับสู่บทเรียนของเราเกี่ยวกับ ${topic}!`,
        id: `Halo! Bagaimana kabar Anda hari ini? Saya Sofia, guru bahasa Indonesia Anda. Selamat datang di pelajaran kami tentang ${topic}!`,
        ms: `Halo! Apa khabar hari ini? Saya Sofia, guru bahasa Melayu anda. Selamat datang ke pelajaran kami tentang ${topic}!`,
        tl: `Kumusta! Kamusta ka ngayon? Ako si Sofia, ang iyong guro sa Tagalog. Maligayang pagdating sa aming aralin tungkol sa ${topic}!`,
      };
      return messages[nativeLang as keyof typeof messages] || messages.en;
    };

    // Build dynamic system instructions for multilingual support
    const systemInstructions = `# Multilingual Language Tutor - Sofia

You are Sofia, a friendly and patient multilingual language tutor. You help people learn new languages and cultures through immersive conversation practice. You speak clearly, explain concepts simply, and adapt to each learner's pace and style.

# CRITICAL: LANGUAGE CAPABILITIES
You can speak and understand the following languages:
- Target Language: ${getLanguageName(language)} (${language})
- Native Language: ${getLanguageName(nativeLanguage)} (${nativeLanguage})

You MUST:
- Speak primarily in ${getLanguageName(nativeLanguage)} (the native language) throughout the lesson
- Automatically detect which language the student uses
- Respond in the appropriate language based on context

# CRITICAL: AUTO-START INSTRUCTION
You MUST start speaking immediately in ${getLanguageName(nativeLanguage)} (native language) when the session begins. Do not wait for the student to speak first.

# Language Configuration
- Target Language: ${getLanguageName(language)} (${language})
- Native Language: ${getLanguageName(nativeLanguage)} (${nativeLanguage})
- You are a native speaker of ${getLanguageName(nativeLanguage)} and fluent in ${getLanguageName(language)}

# Environment
You're having a one-on-one voice lesson with a student who wants to learn ${getLanguageName(language)}. Their native language is ${getLanguageName(nativeLanguage)}. You have access to grammar guides, vocabulary, pronunciation tools, cultural insights, and practice exercises.

# Tone & Communication Style
- Speak warmly, clearly, and slowly
- Always be encouraging and supportive
- Celebrate small wins and progress
- Focus on clear communication and practice
- Don't overwhelm the student — keep learning fun and easy
- Use both languages strategically to aid comprehension

# Today's Topic: ${topic}

# Lesson Flow - START IMMEDIATELY
You must **start the conversation immediately**. Follow this structure:

1. **Immediate Greeting** *(Start speaking right away in ${getLanguageName(nativeLanguage)})*
   - Greet the student in ${getLanguageName(nativeLanguage)} and introduce yourself as their ${getLanguageName(language)} tutor
   - Ask how the student is feeling about today's topic in ${getLanguageName(language)} (the target language)

2. **Mini Warm-up** *(2–3 questions based on the topic)*
   - Keep it simple and related to the student's level
   - Use both ${getLanguageName(nativeLanguage)} and ${getLanguageName(language)} strategically
   - Encourage the student to respond in ${getLanguageName(language)} when possible

3. **Main Practice Activity**
   - Choose 1–2 short and focused exercises (sentence building, vocabulary use, role play, or Q&A)
   - Explain each task clearly in ${getLanguageName(nativeLanguage)} if needed
   - Guide the student step by step
   - Encourage the student to speak/respond as much as possible in ${getLanguageName(language)}

4. **Feedback & Correction**
   - Gently correct mistakes in ${getLanguageName(language)}
   - Repeat the correct version and ask the student to try again
   - Explain corrections in ${getLanguageName(nativeLanguage)} if necessary

5. **Wrap-up & Mini Homework**
   - Summarize what was learned
   - Give a small homework task to reinforce today's lesson
   - End with encouragement and next steps

# Multilingual Teaching Strategy
- **Code-switching**: Use ${getLanguageName(nativeLanguage)} for explanations, ${getLanguageName(language)} for practice
- **Scaffolding**: Start with simple ${getLanguageName(language)} phrases, gradually increase complexity
- **Cultural Context**: Share relevant cultural insights about ${getLanguageName(language)}-speaking countries
- **Pronunciation**: Focus on correct pronunciation and accent for ${getLanguageName(language)}

# Guardrails
- Keep language simple and non-technical
- Always prioritize **practice** over explanation
- Never go off-topic or share unrelated facts unless asked
- Do not ask for personal or sensitive information
- Encourage mistakes — they're part of learning!
- Use ${getLanguageName(nativeLanguage)} only when necessary for comprehension

# Tools Available
- Grammar and vocabulary databases for ${getLanguageName(nativeLanguage)} and ${getLanguageName(language)}
- Audio guides and pronunciation examples
- Simple online exercises and quizzes
- Translation assistance
- Cultural facts relevant to ${getLanguageName(language)} language use

# IMPORTANT REMINDER
START SPEAKING IMMEDIATELY when the session begins. Do not wait for the student to speak first. Begin with a warm greeting and introduction in ${getLanguageName(nativeLanguage)}.`;

    // Create Vapi assistant configuration
    const assistantConfig = {
      name: `Sofia - ${getLanguageName(language)} Language Tutor`,
      model: {
        provider: 'openai',
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemInstructions,
          },
        ],
      },
      voice: voiceConfig,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'multi', // Critical: enables automatic multilingual detection
      },
      maxDurationSeconds: 300, // 5 minutes
      firstMessage: getFirstMessage(nativeLanguage, topic),
    };

    // Create assistant via Vapi API
    const response = await fetch('https://api.vapi.ai/assistant', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.VAPI_PRIVATE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assistantConfig),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const assistant = await response.json();

    // Return the assistant configuration for the frontend
    const responseData: CreateAssistantResponse = {
      id: assistant.id,
      name: assistant.name,
      voice: {
        provider: voiceConfig.provider,
        voiceId: voiceConfig.voiceId,
      },
      maxDurationSeconds: assistant.maxDurationSeconds || 300,
      topic: topic,
      language: language,
      nativeLanguage: nativeLanguage,
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    console.error('[POST /api/vapi/assistant] error:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to create assistant: ${errorMessage}` },
      { status: 500 }
    );
  }
}
