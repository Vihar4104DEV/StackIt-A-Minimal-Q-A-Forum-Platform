import { api } from './client';
import { API_ROUTES } from './config';

// Types
export interface Question {
  id: number;
  title: string;
  content?: string; // Optional since the API response doesn't always include content
  author: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    reputation?: number;
  };
  tags: Array<{
    id: number;
    name: string;
    description?: string;
    color?: string;
    created_at?: string;
    updated_at?: string;
  }>;
  views: number;
  votes: number;
  is_answered: boolean;
  is_closed?: boolean;
  is_featured?: boolean;
  bounty_amount?: number;
  bounty_expires_at?: string;
  created_at: string;
  updated_at?: string;
  answers_count: number;
  votes_count: number;
  is_popular: boolean;
  has_bounty?: boolean;
  short_title?: string;
}

// API Response Types
export interface QuestionsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Question[];
}

export interface CreateQuestionData {
  title: string;
  content: string;
  tag_names: string[];
}

export interface UpdateQuestionData {
  title?: string;
  content?: string;
  tag_names?: string[];
}

export interface QuestionFilters {
  answered?: boolean;
  popular?: boolean;
  has_bounty?: boolean;
  author?: number;
  tags?: number[];
  is_closed?: boolean;
  is_featured?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Questions API
export const questionsApi = {
  // Get all questions
  getQuestions: (filters?: QuestionFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get<QuestionsResponse>(`${API_ROUTES.QUESTIONS.LIST}?${params.toString()}`);
  },

  // Get a single question
  getQuestion: (id: number | string) => {
    return api.get<Question>(API_ROUTES.QUESTIONS.DETAIL(id));
  },

  // Create a new question
  createQuestion: (data: CreateQuestionData) => {
    return api.post<Question>(API_ROUTES.QUESTIONS.CREATE, data);
  },

  // Update a question
  updateQuestion: (id: number | string, data: UpdateQuestionData) => {
    return api.put<Question>(API_ROUTES.QUESTIONS.UPDATE(id), data);
  },

  // Delete a question
  deleteQuestion: (id: number | string) => {
    return api.delete(API_ROUTES.QUESTIONS.DELETE(id));
  },

  // Vote up a question
  voteUp: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}vote_up/`);
  },

  // Vote down a question
  voteDown: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}vote_down/`);
  },

  // Close a question
  closeQuestion: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}close/`);
  },

  // Reopen a question
  reopenQuestion: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}reopen/`);
  },

  // Feature a question (admin only)
  featureQuestion: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}feature/`);
  },

  // Unfeature a question (admin only)
  unfeatureQuestion: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}unfeature/`);
  },

  // Get popular questions
  getPopularQuestions: (filters?: Omit<QuestionFilters, 'popular'>) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get<QuestionsResponse>(`${API_ROUTES.QUESTIONS.LIST}popular/?${params.toString()}`);
  },

  // Get unanswered questions
  getUnansweredQuestions: (filters?: Omit<QuestionFilters, 'answered'>) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get<QuestionsResponse>(`${API_ROUTES.QUESTIONS.LIST}unanswered/?${params.toString()}`);
  },

  // Get featured questions
  getFeaturedQuestions: (filters?: Omit<QuestionFilters, 'is_featured'>) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get<QuestionsResponse>(`${API_ROUTES.QUESTIONS.LIST}featured/?${params.toString()}`);
  },

  // Get bounty questions
  getBountyQuestions: (filters?: Omit<QuestionFilters, 'has_bounty'>) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }
    
    return api.get<QuestionsResponse>(`${API_ROUTES.QUESTIONS.LIST}bounty/?${params.toString()}`);
  },

  // Increment view count
  incrementViews: (id: number | string) => {
    return api.post(`${API_ROUTES.QUESTIONS.DETAIL(id)}increment_views/`);
  },
}; 