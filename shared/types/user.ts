export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  IC = 'ic'
}

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  name?: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  _id: string;
  name: string;
  managerId: string;
  managerName?: string;
  icIds: string[];
  ics?: User[];
  createdAt: string;
  updatedAt: string;
}

export interface WeekGoal {
  _id: string;
  userId: string;
  weekStart: string;
  weekEnd: string;
  goalsContent: string;
  resultsContent?: string;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  text: string;
  highlightedText: string;
  position: number;
  replies: Reply[];
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Reply {
  _id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface AutomationSettings {
  dayOfWeek: number;
  hour: number;
  minute: number;
  timezone: string;
}

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}