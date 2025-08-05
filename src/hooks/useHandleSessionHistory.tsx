import { useRef } from 'react';
import { useTranscript } from '@/contexts/transcript-context';

// Define types for OpenAI SDK events
interface ContentItem {
  type: string;
  text?: string;
  transcript?: string | null;
}

interface HistoryItem {
  type: string;
  itemId: string;
  role: 'user' | 'assistant' | 'system';
  content?: ContentItem[];
}

interface TranscriptionEvent {
  item_id?: string;
  delta?: string;
  transcript?: string;
}

export function useHandleSessionHistory() {
  const {
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItem,
  } = useTranscript();

  // Helper to extract text from content array
  const extractMessageText = (content: ContentItem[] = []) => {
    if (!Array.isArray(content)) return '';
    return content
      .map((c) => {
        if (!c || typeof c !== 'object') return '';
        if (c.type === 'input_text') return c.text ?? '';
        if (c.type === 'audio') return c.transcript ?? '';
        if (c.type === 'input_audio') return c.transcript ?? '';
        if (c.type === 'text') return c.text ?? '';
        return '';
      })
      .filter(Boolean)
      .join('\n');
  };

  // --- Event Handlers ---
  function handleHistoryAdded(item: HistoryItem) {
    if (!item || item.type !== 'message') return;
    const { itemId, role, content = [] } = item;
    if (itemId && role && (role === 'user' || role === 'assistant')) {
      let text = extractMessageText(content);
      if (role === 'user' && !text) text = '[Transcribing...]';
      addTranscriptMessage(itemId, role, text);
    }
  }

  function handleHistoryUpdated(items: HistoryItem[]) {
    items.forEach((item: HistoryItem) => {
      if (!item || item.type !== 'message') return;
      const { itemId, content = [] } = item;
      const text = extractMessageText(content);
      if (text) updateTranscriptMessage(itemId, text, false);
    });
  }

  function handleTranscriptionDelta(item: TranscriptionEvent) {
    const itemId = item.item_id;
    const deltaText = item.delta || '';
    if (itemId) updateTranscriptMessage(itemId, deltaText, true);
  }

  function handleTranscriptionCompleted(item: TranscriptionEvent) {
    const itemId = item.item_id;
    const finalTranscript =
      !item.transcript || item.transcript === '\n'
        ? '[inaudible]'
        : item.transcript;
    if (itemId) {
      updateTranscriptMessage(itemId, finalTranscript, false);
      updateTranscriptItem(itemId, { status: 'DONE' });
    }
  }

  function handleAgentToolStart() {}
  function handleAgentToolEnd() {}
  function handleGuardrailTripped() {}

  const handlersRef = useRef({
    handleHistoryAdded,
    handleHistoryUpdated,
    handleTranscriptionDelta,
    handleTranscriptionCompleted,
    handleAgentToolStart,
    handleAgentToolEnd,
    handleGuardrailTripped,
  });

  return handlersRef;
}
