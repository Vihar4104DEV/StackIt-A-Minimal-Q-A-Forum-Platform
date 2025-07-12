// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  bio: string | null;
  avatar: string | null;
  reputation: number;
  reputation_level: string;
  is_verified: boolean;
  is_premium_user: boolean;
  date_joined: string;
  last_seen: string;
}

export interface UserProfile extends User {
  // Additional profile fields if any
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface PasswordChangeData {
  old_password: string;
  new_password: string;
}

export interface PasswordResetData {
  email: string;
}

// Question Types
export interface Question {
  id: number;
  title: string;
  content: string;
  author: User;
  tags: Tag[];
  votes_count: number;
  answers_count: number;
  views_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
  last_activity: string;
}

export interface QuestionCreate {
  title: string;
  content: string;
  tags: string[];
}

export interface QuestionUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}

// Answer Types
export interface Answer {
  id: number;
  content: string;
  author: User;
  question: number;
  votes_count: number;
  is_accepted: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnswerCreate {
  content: string;
  question: number;
}

export interface AnswerUpdate {
  content: string;
}

// Tag Types
export interface Tag {
  id: number;
  name: string;
  description: string | null;
  questions_count: number;
  created_at: string;
}

export interface TagCreate {
  name: string;
  description?: string;
}

export interface TagUpdate {
  name?: string;
  description?: string;
}

// Vote Types
export interface Vote {
  id: number;
  user: number;
  content_type: 'question' | 'answer';
  object_id: number;
  vote_type: 'up' | 'down';
  created_at: string;
}

export interface VoteData {
  vote_type: 'up' | 'down';
}

// Search Types
export interface SearchParams {
  q: string;
  type?: 'questions' | 'users' | 'tags';
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface SearchResult<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Admin Types
export interface AdminUser extends User {
  is_staff: boolean;
  is_superuser: boolean;
  is_active: boolean;
  date_joined: string;
  last_login: string | null;
}

export interface Report {
  id: number;
  reporter: User;
  reported_user?: User;
  reported_question?: Question;
  reported_answer?: Answer;
  reason: string;
  description: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
}

export interface Statistics {
  total_users: number;
  total_questions: number;
  total_answers: number;
  total_tags: number;
  active_users_today: number;
  questions_today: number;
  answers_today: number;
}

// Notification Types
export interface Notification {
  id: number;
  recipient: User;
  sender?: User;
  notification_type: 'question_answer' | 'answer_accepted' | 'vote_received' | 'mention' | 'system';
  title: string;
  message: string;
  related_question?: number;
  related_answer?: number;
  is_read: boolean;
  created_at: string;
}

// Form Validation Types
export interface ValidationError {
  [field: string]: string[];
}

// API Response Types (extending base types)
export interface QuestionsResponse {
  questions: Question[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

export interface QuestionDetailResponse {
  question: Question;
  answers: Answer[];
  related_questions: Question[];
}

export interface TagsResponse {
  tags: Tag[];
  pagination: {
    count: number;
    next: string | null;
    previous: string | null;
  };
}

// Filter and Sort Types
export interface QuestionFilters {
  tags?: string[];
  author?: number;
  is_accepted?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
}

export interface SortOptions {
  field: 'created_at' | 'updated_at' | 'votes_count' | 'answers_count' | 'views_count';
  direction: 'asc' | 'desc';
} 