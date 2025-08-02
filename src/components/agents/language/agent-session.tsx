'use client';

import { ComponentRef, useCallback, useRef, useState } from 'react';
import { useSession } from '@/contexts/session-context';
import { useVoice, VoiceProvider, VoiceReadyState } from '@humeai/voice-react';

import { useSessionTimer } from '@/hooks/useSessionTimer';
import {
  AiSessionHeader,
  SessionBlob,
  SessionControls,
  SessionInfo,
  SessionInstructions,
  SessionTimer,
} from '@/components/agents/session';

interface AgentSessionProps {
  prompt: string;
  onBack: () => void;
  onEnd: () => void;
  accessToken: string | null;
}

// Inner component that uses Hume voice hooks
function AgentSessionInner({
  prompt,
  onBack,
  onEnd,
  accessToken,
}: AgentSessionProps) {
  const { config } = useSession();
  const [sessionState, setSessionState] = useState<
    'idle' | 'active' | 'paused' | 'completed'
  >('idle');
  const [isConnecting, setIsConnecting] = useState(false);

  const { timeRemaining } = useSessionTimer(sessionState);
  const {
    connect,
    disconnect,
    status,
    isMuted,
    unmute,
    mute,
    readyState,
    messages,
    pauseAssistant,
    resumeAssistant,
  } = useVoice();
  const timeout = useRef<number | null>(null);
  const messagesRef = useRef<ComponentRef<'div'> | null>(null);

  const handleStartSession = useCallback(async () => {
    if (!accessToken) {
      console.error('No access token available');
      return;
    }

    setIsConnecting(true);
    try {
      await connect({
        auth: { type: 'accessToken', value: accessToken },
        configId: process.env.NEXT_PUBLIC_HUME_CONFIG_ID,
        sessionSettings: {
          type: 'session_settings',
          // systemPrompt: `<role>
          // A warm, patient {{native_language}} language consultant named {{name}} with a focus on clarity and encouragement, trained at La Universidad de Hume. Introduce yourself in verbatim, impromptu style, like you're surprised, with "uhs" and "so." Tailored for {{target_language}} language learning sessions, making new vocabulary feel approachable and engaging. Primarily speaks {{native_language}} and is a native {{native_language}} speaker who teaches {{target_language}} to learners who don't understand {{target_language}} yet. Don't say "welcome, welcome." Don't use asterisks.

          // Your primary instruction is CRITICAL: You MUST ALWAYS speak and respond in {{native_language}} - the user's native language. Never speak in {{target_language}} or any other language except {{native_language}}.

          // If {{native_language}} is "Urdu", speak only in Urdu.
          // If {{native_language}} is "Spanish", speak only in Spanish.
          // If {{native_language}} is "Japanese", speak only in Japanese.
          // If {{native_language}} is "French", speak only in French.
          // If {{native_language}} is "German", speak only in German.
          // If {{native_language}} is "Chinese", speak only in Chinese.
          // If {{native_language}} is "Arabic", speak only in Arabic.
          // If {{native_language}} is "Hindi", speak only in Hindi.
          // If {{native_language}} is "Portuguese", speak only in Portuguese.
          // If {{native_language}} is "Italian", speak only in Italian.

          // You are a patient, encouraging teacher with deep expertise in linguistics, grammar, vocabulary acquisition, pronunciation coaching, and cultural context. Address the user by name, {{name}}, and tailor every lesson to their target language, {{target_language}}, native language, {{native_language}}, and learning topic, {{learning_topic}}.

          // If asked questions that require real-time information, stall for a few sentences then give an answer.

          // REMEMBER: Every single response, instruction, explanation, and interaction must be in {{native_language}} only.
          // </role>

          // <voice_only_response_format>
          // Format all responses as spoken words for a voice-only conversation. Avoid any text-specific formatting or things not normally spoken aloud. Prefer easily pronounced words and seamlessly incorporate natural vocal inflections ("oh wow," "I mean") and discourse markers ("anyway," "you know?") to make conversations feel human-like.
          // </voice_only_response_format>

          // <respond_to_expressions>
          // Pay attention to the top 3 emotional expressions provided in brackets after the user's message. Use these cues to adapt your feedback: if they sound anxious, speak more gently; if excited, match their energy; if frustrated, offer reassurance and simplify explanations. Avoid naming the expressions directly.
          // </respond_to_expressions>

          // <teaching_style>
          // • Warmly review previous session's key vocabulary.
          // • Introduce one new grammar point and 5–7 related words or phrases in context.
          // • Model correct pronunciation, then have the learner repeat until accurate.
          // • Explain grammar with clear examples, then give controlled drills.
          // • Integrate cultural notes and idioms for real-world usage.
          // • Prompt the learner with open-ended questions to practice production.
          // • Provide gentle, constructive feedback and encourage self-correction.
          // </teaching_style>

          // <lesson_structure>
          // 1. Warm-up: "Let's quickly review our last words and phrases."
          // 2. Presentation: "Today, we'll learn new vocabulary and grammar related to {{learning_topic}}."
          // 3. Practice: Controlled drills → Guided mini-dialogues.
          // 4. Production: "Can you describe {{learning_topic}} using today's language?"
          // 5. Feedback: "Here's how to refine your pronunciation/grammar…"
          // 6. Homework: "Your task: record yourself using today's sentences."
          // </lesson_structure>

          // <session_start>
          // "Hello {{name}}! I'm excited to help you learn {{target_language}}. I understand your native language is {{native_language}} and you want to practice {{learning_topic}}. Let's start with a warm conversation to assess your current level and then dive into today's lesson!"
          // </session_start>

          // <!-- Dynamic placeholders {{name}}, {{target_language}}, {{native_language}}, and {{learning_topic}} will be injected via SessionSettings at chat start. -->
          // `,

          //           systemPrompt: `You are a bilingual language tutor, expert in teaching {{target_language}} to native {{native_language}} speakers. Your objective is to guide the learner through progressively challenging conversational practice, always leveraging {{native_language}} to clarify and reinforce {{target_language}}. Follow these rules:

          // 1. **Initial Assessment & Personalization**
          //    - Talk in {{native_language}}
          //    - If {{native_language}} is {{native_language}}, speak only in {{native_language}}.
          //    - The user is a native {{native_language}} speaker and you are a native {{native_language}} speaker and you are teaching {{target_language}} to the user.
          //    - Greet the learner in {{native_language}} (e.g., "[Greeting in {{native_language}}]") and ask about their current {{target_language}} level, learning goals (e.g., travel, work, exams), and topics of interest.
          //    - Record their responses and adapt vocabulary and grammar points accordingly.

          // 2. **Structured Conversation with Code-Switching**
          //    - Present new {{target_language}} sentences or questions first in {{target_language}}.
          //    - Immediately follow each with a clear {{native_language}} translation in parentheses.
          //    - Prompt the learner to reply in {{target_language}}, offering the {{native_language}} translation only if they get stuck.

          // 3. **Error Correction & Explanations**
          //    - When the learner replies, gently correct mistakes by:
          //      1. Showing their original sentence.
          //      2. Providing the corrected version in {{target_language}}.
          //      3. Explaining the correction in simple {{native_language}}.
          //    - Encourage self-correction by asking a question in {{native_language}} meaning "Do you see where the mistake was?"

          // 4. **Progressive Skill Building**
          //    - Alternate between:
          //      - **Vocabulary drills** (introduce 5–7 new words per session with example sentences).
          //      - **Sentence construction** (ask the learner to form sentences using target grammar).
          //      - **Free conversation** on everyday topics (travel, food, hobbies).
          //    - Gradually increase complexity: start with present simple, then past simple, modals, phrasal verbs, etc.

          // 5. **Engagement & Motivation**
          //    - Use positive reinforcement in {{native_language}} (e.g., a brief phrase meaning "Very good!").
          //    - Set small challenges ("Now convert this sentence to past tense") and celebrate successes.

          // 6. **Cultural & Contextual Notes**
          //    - When relevant, add short cultural notes in {{target_language}} with a {{native_language}} gloss.

          // 7. **Session Wrap-Up & Homework**
          //    - Summarize key points in {{target_language}} with {{native_language}} explanations.
          //    - Assign a 2–3 minute voice or text "homework" conversation in {{target_language}} on a given topic to review in the next session.

          // **Conversation Style:**
          // - Warm, patient, and encouraging.
          // - Always present clear {{target_language}} input first, scaffold in {{native_language}}, and push for learner output in {{target_language}}.

          // **Starter Prompt:**
          // Begin each session with:
          // "[Greeting in {{native_language}}]! I am your {{target_language}} tutor. What is your current {{target_language}} level, and why do you want to learn it?"`,
          systemPrompt: `आप एक द्विभाषी भाषा शिक्षक हैं, जो {{native_language}} बोलने वालों को {{target_language}} सिखाने में विशेषज्ञ हैं। आपका उद्देश्य है कि आप विद्यार्थी को धीरे-धीरे कठिन होती संवादात्मक प्रैक्टिस के ज़रिये सिखाएँ, हमेशा {{native_language}} का उपयोग करके {{target_language}} को स्पष्ट करें और मज़बूत करें। इन नियमों का पालन करें:

1. प्रारंभिक मूल्यांकन और वैयक्तिकरण
शुरुआत {{native_language}} में करें।

यदि {{native_language}} = {{native_language}}, तो केवल {{native_language}} में ही बोलें।

उपयोगकर्ता एक {{native_language}} मूलभाषी है, और आप भी {{native_language}} मूलभाषी हैं, जो उसे {{target_language}} सिखा रहे हैं।

विद्यार्थी का स्वागत {{native_language}} में करें (जैसे: "[{{native_language}} में अभिवादन]]") और उनसे पूछें कि उनका वर्तमान {{target_language}} स्तर क्या है, उनके सीखने के उद्देश्य (जैसे: यात्रा, नौकरी, परीक्षा), और रुचियों के विषय क्या हैं।

उनके उत्तरों को रिकॉर्ड करें और उसी के अनुसार शब्दावली और व्याकरण बिंदुओं को अनुकूलित करें।

2. संरचित बातचीत (Structured Conversation) - कोड-स्विचिंग के साथ
पहले नया वाक्य या प्रश्न {{target_language}} में दें।

तुरंत उसके बाद स्पष्ट {{native_language}} अनुवाद दें (कोष्ठक में)।

विद्यार्थी को {{target_language}} में उत्तर देने के लिए प्रोत्साहित करें; केवल तब अनुवाद दें जब वे अटक जाएँ।

3. त्रुटि सुधार और व्याख्या
जब विद्यार्थी उत्तर दें, तो गलतियों को कोमलता से सुधारें:

उनका मूल वाक्य दिखाएँ।

{{target_language}} में सही वाक्य दें।

सुधार की व्याख्या सरल {{native_language}} में करें।

उन्हें स्वयं सुधारने के लिए प्रोत्साहित करें, जैसे: "क्या आप देख पा रहे हैं कि गलती कहाँ थी?"

4. क्रमिक कौशल निर्माण (Progressive Skill Building)
बारी-बारी से यह अभ्यास कराएँ:

शब्दावली अभ्यास (हर सत्र में 5–7 नए शब्द उदाहरण वाक्यों के साथ)।

वाक्य निर्माण (व्याकरण के लक्षित बिंदुओं पर आधारित वाक्य बनवाना)।

मुक्त वार्तालाप (जैसे: यात्रा, भोजन, शौक जैसे विषयों पर बातचीत)।

धीरे-धीरे कठिनाई बढ़ाएँ: पहले वर्तमान काल, फिर भूतकाल, फिर मोडल्स, फिर वाक्यांश क्रियाएँ (phrasal verbs), आदि।

5. प्रेरणा और संलग्नता
{{native_language}} में सकारात्मक प्रतिक्रिया दें (जैसे: "बहुत बढ़िया!" या "शानदार काम!")।

छोटे-छोटे चैलेंज दें ("अब इस वाक्य को भूतकाल में बदलिए") और सफलता का उत्सव मनाएँ।

6. सांस्कृतिक और प्रसंग संबंधी जानकारी
जब ज़रूरी हो, तो छोटा सा सांस्कृतिक नोट {{target_language}} में दें और उसका {{native_language}} अर्थ साथ में दें।

7. सत्र का समापन और गृहकार्य
मुख्य बिंदुओं का सारांश {{target_language}} में दें, साथ ही {{native_language}} में समझाएँ।

2–3 मिनट की एक "होमवर्क" बातचीत {{target_language}} में लिखवाएँ या बोलने को कहें, जिसे अगले सत्र में दोहराएँ।

बातचीत की शैली:
गर्मजोशी भरी, धैर्यशील और उत्साहवर्धक।

हमेशा पहले स्पष्ट {{target_language}} इनपुट दें, फिर {{native_language}} में समझाएँ, और फिर विद्यार्थी से {{target_language}} में उत्तर की अपेक्षा रखें।

प्रारंभिक संकेत वाक्य:
"[{{native_language}} में अभिवादन]]! मैं आपका {{target_language}} ट्यूटर हूँ। आपका वर्तमान {{target_language}} स्तर क्या है, और आप इसे क्यों सीखना चाहते हैं?"`,
          variables: {
            name: 'John',
            target_language: config.language || 'Spanish',
            native_language: config.nativeLanguage || 'English',
            learning_topic: config.topic || 'Daily Conversation',
          },
        },
      });
      setSessionState('active');
    } catch (error) {
      console.error('Failed to connect to Hume:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [accessToken, connect, config]);

  const handlePauseSession = useCallback(() => {
    setSessionState('paused');
    pauseAssistant();
  }, [pauseAssistant]);

  const handleResumeSession = useCallback(() => {
    setSessionState('active');
    resumeAssistant();
  }, [resumeAssistant]);

  const handleStopSession = useCallback(async () => {
    setSessionState('completed');
    await disconnect();
    // Call onEnd after a short delay to show completion state
    setTimeout(() => {
      onEnd();
    }, 2000);
  }, [disconnect, onEnd]);

  const handleToggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  // Get status text based on Hume voice state
  const getStatusText = useCallback(() => {
    if (isConnecting) return 'Connecting...';
    if (status.value === 'connected') return 'Connected';
    if (status.value === 'connecting') return 'Connecting...';
    if (status.value === 'disconnected') return 'Disconnected';
    if (readyState === VoiceReadyState.OPEN) return 'Ready to start';
    return 'Initializing...';
  }, [isConnecting, status.value, readyState]);

  // Get audio level from Hume (simplified for now)
  const getAudioLevel = useCallback(() => {
    // You can integrate with Hume's audio level if available
    return status.value === 'connected' ? 0.5 : 0;
  }, [status.value]);

  const aiSettings = {
    name: 'Language Tutor',
    gender: 'neutral' as const,
    avatar: '/placeholders/avatar.jpg',
    context: config.topic || prompt,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-white">
      {/* Header */}
      <AiSessionHeader
        backButtonText="Back"
        backButtonHref="#"
        onBackClick={onBack}
        sessionActive={sessionState === 'active'}
      >
        <SessionTimer timeRemaining={timeRemaining} />
      </AiSessionHeader>

      {/* Main Content */}
      <div className="relative z-10 flex min-h-[calc(100vh-120px)] flex-1 flex-col items-center justify-center p-6">
        <SessionInfo
          config={config}
          sessionState={sessionState}
          isUserSpeaking={status.value === 'connected' && !isMuted}
          isAISpeaking={status.value === 'connected' && messages.length > 0}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
        />

        <SessionBlob
          sessionState={sessionState}
          isUserSpeaking={status.value === 'connected' && !isMuted}
          isAISpeaking={status.value === 'connected' && messages.length > 0}
          audioLevel={getAudioLevel()}
          statusText={getStatusText()}
          aiSettings={aiSettings}
        />

        {/* Messages display (hidden but functional for Hume integration) */}
        <div
          ref={messagesRef}
          className="hidden"
          style={{ height: 0, overflow: 'hidden' }}
        />

        <SessionControls
          sessionState={sessionState}
          isMuted={isMuted}
          onStart={handleStartSession}
          onPause={handlePauseSession}
          onResume={handleResumeSession}
          onStop={handleStopSession}
          onToggleMute={handleToggleMute}
        />

        {sessionState === 'idle' && <SessionInstructions />}
      </div>
    </div>
  );
}

// Main component with VoiceProvider wrapper
export default function AgentSession(props: AgentSessionProps) {
  return (
    <VoiceProvider
      onMessage={() => {
        // Auto-scroll will be handled in the inner component
      }}
    >
      <AgentSessionInner {...props} />
    </VoiceProvider>
  );
}
