import { Conversation } from '@/components/agents/eleven-labs/conversation';

export default function ElevenLabsPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="mb-8 text-center text-4xl font-bold">
          ElevenLabs Conversational AI
        </h1>
        <Conversation />
      </div>
    </main>
  );
}
