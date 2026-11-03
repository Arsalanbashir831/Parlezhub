import { ChatRoom } from '@/types/chat';

export interface ChatPeer {
  name: string;
  avatar?: string;
  userId: string;
}

/**
 * The chat list labels participant1 as the student and participant2 as the
 * teacher, but a row follows whoever created it. Preferring the side that is
 * not the current user keeps the name and picture right when the two disagree.
 */
export function resolveChatPeer(
  chat: ChatRoom,
  currentUserRole: 'student' | 'consultant',
  currentUserId?: string
): ChatPeer {
  const student: ChatPeer = {
    name: chat.student_name,
    avatar: chat.student_avatar,
    userId: chat.student_id,
  };
  const consultant: ChatPeer = {
    name: chat.consultant_name,
    avatar: chat.consultant_avatar,
    userId: chat.teacher_id,
  };

  if (currentUserId) {
    if (consultant.userId === currentUserId) return student;
    if (student.userId === currentUserId) return consultant;
  }

  return currentUserRole === 'student' ? consultant : student;
}

export const initialsOf = (name?: string) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
