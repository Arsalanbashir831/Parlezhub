export interface DashboardStats {
  totalConversations: number;
  totalMinutes: number;
  upcomingMeetings: number;
  currentStreak: number;
  languagesLearning: Language[];
}

export interface Language {
  name: string;
  level: string;
  progress: number;
}

export interface RecentConversation {
  id: string;
  avatarName: string;
  language: string;
  duration: number;
  score: number;
  date: string;
  topic: string;
}

export interface UpcomingMeeting {
  id: string;
  consultantName: string;
  subject: string;
  date: string;
  duration: number;
  avatar?: string;
}
