'use client';

import { useCallback, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

import { formatDateTime } from '@/lib/utils';

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export interface Meeting {
  id: string;
  teacherName?: string; // Optional for teacher view
  studentName?: string; // For teacher view
  teacherAvatar?: string;
  studentAvatar?: string; // For teacher view
  subject: string;
  date: string; // ISO string
  duration: number; // minutes
  status: MeetingStatus;
  language: string;
  price: number;
  location: string;
  meetingLink?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
  cancelReason?: string;
}

// Mock meetings data for students (meetings they booked with teachers)
const mockStudentMeetings = [
  {
    id: '1',
    teacherName: 'Maria Rodriguez',
    teacherAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Grammar Review',
    date: '2025-07-30T15:00:00Z', // Future date
    duration: 60,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/abc123',
    language: 'Spanish',
    price: 25,
    location: 'Online',
    notes: 'Focus on past tense conjugations and subjunctive mood',
  },
  {
    id: '2',
    teacherName: 'Jean Dubois',
    teacherAvatar: '/placeholders/avatar.jpg',
    subject: 'French Pronunciation',
    date: '2025-08-02T10:00:00Z', // Future date
    duration: 45,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/def456',
    language: 'French',
    price: 30,
    location: 'Online',
    notes: 'Work on nasal vowels and liaison',
  },
  {
    id: '3',
    teacherName: 'Hans Mueller',
    teacherAvatar: '/placeholders/avatar.jpg',
    subject: 'German Business Conversation',
    date: '2025-08-05T14:30:00Z', // Future date
    duration: 90,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/ghi789',
    language: 'German',
    price: 35,
    location: 'Online',
    notes: 'Practice formal business presentations',
  },
  {
    id: '4',
    teacherName: 'Maria Rodriguez',
    teacherAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Conversation Practice',
    date: '2024-01-10T15:00:00Z',
    duration: 60,
    status: 'completed' as MeetingStatus,
    language: 'Spanish',
    price: 25,
    location: 'Online',
    rating: 5,
    feedback:
      'Excellent session! Maria helped me improve my conversational skills significantly.',
  },
  {
    id: '5',
    teacherName: 'Jean Dubois',
    teacherAvatar: '/placeholders/avatar.jpg',
    subject: 'French Literature Discussion',
    date: '2024-01-08T16:00:00Z',
    duration: 75,
    status: 'completed' as MeetingStatus,
    language: 'French',
    price: 30,
    location: 'Online',
    rating: 4,
    feedback: 'Great discussion about French poetry. Very insightful!',
  },
] as Meeting[];

// Mock meetings data for teachers (students who booked sessions with them)
const mockTeacherMeetings = [
  {
    id: 't1',
    studentName: 'Alex Johnson',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Grammar Review',
    date: '2025-07-30T15:00:00Z', // Future date
    duration: 60,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/abc123',
    language: 'Spanish',
    price: 25,
    location: 'Online',
    notes:
      'Student wants to focus on past tense conjugations and subjunctive mood',
  },
  {
    id: 't2',
    studentName: 'Sarah Chen',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Conversation Practice',
    date: '2025-08-01T14:00:00Z', // Future date
    duration: 45,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/def456',
    language: 'Spanish',
    price: 25,
    location: 'Online',
    notes: 'Intermediate level student, focus on fluency',
  },
  {
    id: 't3',
    studentName: 'Mike Wilson',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Business Vocabulary',
    date: '2025-08-03T16:30:00Z', // Future date
    duration: 90,
    status: 'scheduled' as MeetingStatus,
    meetingLink: 'https://meet.example.com/ghi789',
    language: 'Spanish',
    price: 35,
    location: 'Online',
    notes: 'Corporate client, advanced level',
  },
  {
    id: 't4',
    studentName: 'Emma Davis',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Pronunciation',
    date: '2024-01-10T15:00:00Z',
    duration: 60,
    status: 'completed' as MeetingStatus,
    language: 'Spanish',
    price: 25,
    location: 'Online',
    rating: 5,
    feedback:
      'Great student! Very motivated and improved significantly during our session.',
  },
  {
    id: 't5',
    studentName: 'David Kim',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Culture Discussion',
    date: '2024-01-08T16:00:00Z',
    duration: 75,
    status: 'completed' as MeetingStatus,
    language: 'Spanish',
    price: 30,
    location: 'Online',
    rating: 4,
    feedback:
      'Engaging conversation about Latin American culture. Student showed great interest.',
  },
  {
    id: 't6',
    studentName: 'Lisa Brown',
    studentAvatar: '/placeholders/avatar.jpg',
    subject: 'Spanish Grammar Basics',
    date: '2024-01-05T11:00:00Z',
    duration: 45,
    status: 'cancelled' as MeetingStatus,
    language: 'Spanish',
    price: 25,
    location: 'Online',
    cancelReason: 'Student had a family emergency',
  },
] as Meeting[];

export function useMeetings() {
  const router = useRouter();
  const pathname = usePathname();

  // Determine if we're in teacher or student context
  const isTeacher = pathname?.includes('/teacher/');
  const mockData = isTeacher ? mockTeacherMeetings : mockStudentMeetings;

  // UI state
  const [meetings, setMeetings] = useState<Meeting[]>(mockData);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [activeTab, setActiveTab] = useState<
    'upcoming' | 'completed' | 'cancelled'
  >('upcoming');

  // Handlers
  const handleJoinMeeting = useCallback((meeting: Meeting) => {
    if (meeting.meetingLink) window.open(meeting.meetingLink, '_blank');
  }, []);

  const handleMessageTeacher = useCallback(
    (personId: string) => {
      if (isTeacher) {
        // Teacher messaging a student
        router.push(ROUTES.TEACHER.CHAT + '?student=' + personId);
      } else {
        // Student messaging a teacher
        router.push(ROUTES.STUDENT.CHAT + '?teacher=' + personId);
      }
    },
    [router, isTeacher]
  );

  const getStatusColor = useCallback((status: MeetingStatus) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }, []);

  // Derived data
  const filteredMeetings = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const now = new Date();

    return meetings.filter((m) => {
      // Search matches both teacher and student names
      const matchesSearch =
        m.teacherName?.toLowerCase().includes(q) ||
        m.studentName?.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q) ||
        m.language.toLowerCase().includes(q);

      const matchesLanguage =
        selectedLanguage === 'all' || m.language === selectedLanguage;

      let matchesTab = true;
      if (activeTab === 'upcoming') {
        matchesTab = m.status === 'scheduled' && new Date(m.date) > now;
      } else if (activeTab === 'completed') {
        matchesTab = m.status === 'completed';
      } else if (activeTab === 'cancelled') {
        matchesTab = m.status === 'cancelled';
      }

      return matchesSearch && matchesLanguage && matchesTab;
    });
  }, [meetings, searchQuery, selectedLanguage, activeTab]);

  const counts = useMemo(() => {
    const now = new Date();
    const upcoming = meetings.filter(
      (m) => m.status === 'scheduled' && new Date(m.date) > now
    ).length;
    const completed = meetings.filter((m) => m.status === 'completed').length;
    const cancelled = meetings.filter((m) => m.status === 'cancelled').length;
    return { upcoming, completed, cancelled };
  }, [meetings]);

  const totalCompletedHours = useMemo(() => {
    const mins = meetings
      .filter((m) => m.status === 'completed')
      .reduce((sum, m) => sum + m.duration, 0);
    return Math.round(mins / 60);
  }, [meetings]);

  // Optional helper: next upcoming meeting label
  const nextUpcomingLabel = useMemo(() => {
    const next = meetings
      .filter((m) => m.status === 'scheduled' && new Date(m.date) > new Date())
      .sort((a, b) => +new Date(a.date) - +new Date(b.date))[0];
    return next ? formatDateTime(next.date) : 'None scheduled';
  }, [meetings, formatDateTime]);

  return {
    meetings,
    setMeetings,
    searchQuery,
    setSearchQuery,
    selectedLanguage,
    setSelectedLanguage,
    activeTab,
    setActiveTab,
    filteredMeetings,
    counts,
    totalCompletedHours,
    nextUpcomingLabel,
    handleJoinMeeting,
    handleMessageTeacher,
    getStatusColor,
  };
}
