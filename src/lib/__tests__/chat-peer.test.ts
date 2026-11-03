import { describe, expect, it } from 'vitest';

import { resolveChatPeer } from '@/lib/chat-peer';
import { ChatRoom } from '@/types/chat';

const room: ChatRoom = {
  id: 'chat-1',
  student_id: 'student-1',
  teacher_id: 'teacher-1',
  student_name: 'Aspiring Student',
  consultant_name: 'Pt. Ram Sharma',
  student_avatar: 'https://cdn/student.png',
  consultant_avatar: 'https://cdn/consultant.png',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('resolveChatPeer', () => {
  it('shows the astrologer to a student', () => {
    expect(resolveChatPeer(room, 'student', 'student-1').name).toBe(
      'Pt. Ram Sharma'
    );
  });

  it('shows the student to a consultant', () => {
    expect(resolveChatPeer(room, 'consultant', 'teacher-1').name).toBe(
      'Aspiring Student'
    );
  });

  it('follows the participants rather than the role when a row is stored swapped', () => {
    // Regression: a chat created from the consultant side puts the teacher in
    // participant1, and role-based naming then showed the reader their own name
    // and picture as the person they were talking to.
    const peer = resolveChatPeer(room, 'student', 'teacher-1');

    expect(peer).toEqual({
      name: 'Aspiring Student',
      avatar: 'https://cdn/student.png',
      userId: 'student-1',
    });
  });

  it('falls back to the role when the id is not yet loaded', () => {
    expect(resolveChatPeer(room, 'student', '').name).toBe('Pt. Ram Sharma');
  });
});
