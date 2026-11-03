import { ANALYSIS_CATEGORIES, ANALYSIS_TOPICS } from '@/constants/astrology';

/**
 * The calculation service keeps one thread per topic, so each topic behaves as
 * its own conversation in the rail.
 */
export interface ChatConversation {
  id: string;
  title: string;
  description: string;
  groupId: string;
  groupTitle: string;
}

const CORE_CONVERSATIONS: ChatConversation[] = [
  { id: 'divisional-charts', title: 'Birth and divisional charts', description: 'Placements, houses and the chart picture as a whole', groupId: 'core', groupTitle: 'Your chart' },
  { id: 'dasha', title: 'Dasha periods', description: 'Planetary periods and what colours the current one', groupId: 'core', groupTitle: 'Your chart' },
  { id: 'navatara', title: 'Your nine stars', description: 'Tara Bala counted from your birth Nakshatra', groupId: 'core', groupTitle: 'Your chart' },
];

const TOPIC_CONVERSATIONS: ChatConversation[] = ANALYSIS_TOPICS.filter(
  topic => topic.id !== 'charts' && topic.id !== 'navatara',
).map(topic => ({
  id: topic.id,
  title: topic.title,
  description: topic.description,
  groupId: topic.category,
  groupTitle: ANALYSIS_CATEGORIES.find(category => category.id === topic.category)?.title ?? 'More analyses',
}));

export const CHAT_CONVERSATIONS: ChatConversation[] = [...CORE_CONVERSATIONS, ...TOPIC_CONVERSATIONS];

function groupConversations(conversations: ChatConversation[]) {
  return conversations.reduce<{ id: string; title: string; conversations: ChatConversation[] }[]>(
    (groups, conversation) => {
      const existing = groups.find(group => group.id === conversation.groupId);
      if (existing) existing.conversations.push(conversation);
      else groups.push({ id: conversation.groupId, title: conversation.groupTitle, conversations: [conversation] });
      return groups;
    },
    [],
  );
}

export const CHAT_GROUPS = groupConversations(CHAT_CONVERSATIONS);

export function chatConversation(id: string): ChatConversation | undefined {
  return CHAT_CONVERSATIONS.find(conversation => conversation.id === id);
}

const CORE_PROMPTS: Record<string, string[]> = {
  'divisional-charts': [
    'Explain my birth chart in simple terms.',
    'Which placements in my chart matter most, and why?',
    'What do my divisional charts add to the main chart?',
  ],
  dasha: [
    'Help me understand my current Dasha.',
    'What is the theme of this Mahadasha and its sub-periods?',
    'How should I read my Dasha timeline alongside current transits?',
  ],
  navatara: [
    'Explain how Navatara works with my birth star.',
    'Which Tara categories are favourable for me, and what do they mean?',
    'How does Tara Bala relate to my Dasha periods?',
  ],
};

export function chatPromptsFor(id: string): string[] {
  if (CORE_PROMPTS[id]) return CORE_PROMPTS[id];
  const conversation = chatConversation(id);
  if (!conversation) return ['Explain this analysis using my chart.'];
  return [
    `Start with the basics of “${conversation.title}” in my chart.`,
    `What do the traditional texts say about “${conversation.title}”?`,
    `Which of my placements matter most for “${conversation.title}”?`,
  ];
}

export function filteredChatGroups(search: string) {
  const words = search.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const matches = (conversation: ChatConversation) => {
    if (!words.length) return true;
    const haystack = `${conversation.title} ${conversation.description} ${conversation.groupTitle}`.toLocaleLowerCase();
    return words.every(word => haystack.includes(word));
  };
  return groupConversations(CHAT_CONVERSATIONS.filter(matches));
}
