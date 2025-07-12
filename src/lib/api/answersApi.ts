import { api } from './client';
import { API_ROUTES } from './config';

// Types
export interface Answer {
  id: number;
  content: string;
  question: number;
  author: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
    reputation?: number;
  };
  is_accepted: boolean;
  votes: number;
  is_edited: boolean;
  edit_count: number;
  last_edited_at?: string;
  created_at: string;
  updated_at: string;
  votes_count: number;
  is_best_answer: boolean;
  is_highly_voted: boolean;
  short_content: string;
}

export interface CreateAnswerData {
  content: string;
  question: number;
}

export interface UpdateAnswerData {
  content: string;
}

export interface AnswerFilters {
  question?: number;
  author?: number;
  is_accepted?: boolean;
  ordering?: string;
  page?: number;
  page_size?: number;
}

// Answers API
export const answersApi = {
  // Get all answers
  getAnswers: (filters?: AnswerFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get<Answer[]>(`${API_ROUTES.ANSWERS.LIST}?${params.toString()}`);
  },

  // Get a single answer
  getAnswer: (id: number | string) => {
    return api.get<Answer>(API_ROUTES.ANSWERS.DETAIL(id));
  },

  // Create a new answer
  createAnswer: (data: CreateAnswerData) => {
    return api.post<Answer>(API_ROUTES.ANSWERS.CREATE, data);
  },

  // Update an answer
  updateAnswer: (id: number | string, data: UpdateAnswerData) => {
    return api.put<Answer>(API_ROUTES.ANSWERS.UPDATE(id), data);
  },

  // Delete an answer
  deleteAnswer: (id: number | string) => {
    return api.delete(API_ROUTES.ANSWERS.DELETE(id));
  },

  // Accept an answer
  acceptAnswer: (id: number | string) => {
    return api.post(`${API_ROUTES.ANSWERS.DETAIL(id)}accept/`);
  },

  // Unaccept an answer
  unacceptAnswer: (id: number | string) => {
    return api.post(`${API_ROUTES.ANSWERS.DETAIL(id)}unaccept/`);
  },

  // Vote up an answer
  voteUp: (id: number | string) => {
    return api.post(`${API_ROUTES.ANSWERS.DETAIL(id)}vote_up/`);
  },

  // Vote down an answer
  voteDown: (id: number | string) => {
    return api.post(`${API_ROUTES.ANSWERS.DETAIL(id)}vote_down/`);
  },

  // Get accepted answers
  getAcceptedAnswers: (filters?: Omit<AnswerFilters, 'is_accepted'>) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get<Answer[]>(`${API_ROUTES.ANSWERS.LIST}accepted/?${params.toString()}`);
  },

  // Get highly voted answers
  getHighlyVotedAnswers: (filters?: AnswerFilters) => {
    const params = new URLSearchParams();
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    
    return api.get<Answer[]>(`${API_ROUTES.ANSWERS.LIST}highly_voted/?${params.toString()}`);
  },
}; 