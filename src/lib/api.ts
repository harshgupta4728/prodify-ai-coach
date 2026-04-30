import { config } from './config';

const API_BASE_URL = config.apiBaseUrl;

export interface User {
  _id: string;
  name: string;
  email: string;
  bio?: string;
  university?: string;
  major?: string;
  graduationYear?: string;
  location?: string;
  portfolio?: string;
  profilePicture?: string;
  createdAt: string;
  lastLogin: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
  otp: string;
}

export interface SendOtpData {
  email: string;
  purpose: 'signup' | 'signin';
}

export interface OtpLoginData {
  email: string;
  otp: string;
}

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('Making request to:', url);
    console.log('Request options:', options);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const token = this.getToken(); 
    if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      return data;
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async sendOtp(data: SendOtpData): Promise<{ message: string }> {
    return this.request<{ message: string }>('/auth/send-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signup(data: SignupData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(data: LoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signinWithOtp(data: OtpLoginData): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/signin-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async uploadProfilePicture(file: File): Promise<{ message: string; profilePicture: string; user: User }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const url = `${API_BASE_URL}/auth/profile-picture`;
    
    const headers: HeadersInit = {};
    if (this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Profile picture upload failed:', error);
      throw error;
    }
  }

  async removeProfilePicture(): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/auth/profile-picture', {
      method: 'DELETE',
    });
  }

  async deleteAccount(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/auth/account', {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Delete account API error:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return this.request<{ status: string; message: string; timestamp: string }>('/health');
  }

  // Progress tracking
  async getProgress(): Promise<any> {
    return this.request<any>('/progress');
  }

  async addProblem(problemData: any): Promise<any> {
    return this.request<any>('/progress/problem', {
      method: 'POST',
      body: JSON.stringify(problemData),
    });
  }

  async getRecommendations(): Promise<any> {
    return this.request<any>('/progress/recommendations');
  }

  async updateGoals(goals: { dailyGoal?: number; weeklyGoal?: number }): Promise<any> {
    return this.request<any>('/progress/goals', {
      method: 'PUT',
      body: JSON.stringify(goals),
    });
  }

  async getProblems(params?: { page?: number; limit?: number; topic?: string; difficulty?: string; platform?: string }): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<any>(`/progress/problems${queryParams}`);
  }

  // Problem Bank methods
  async getProblemBank(params?: { topic?: string; difficulty?: string; page?: number; limit?: number }): Promise<any> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    return this.request<any>(`/progress/problem-bank${queryParams}`);
  }

  async getProblemsByTopic(topic: string): Promise<any> {
    return this.request<any>(`/progress/problems-by-topic/${topic}`);
  }

  async markProblemSolved(data: { problemId: string; solution?: string; language?: string; timeSpent?: number; notes?: string }): Promise<any> {
    return this.request<any>('/progress/mark-solved', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetProgress(): Promise<any> {
    return this.request<any>('/progress/reset', {
      method: 'DELETE',
    });
  }

  async getTodaysProblem(): Promise<any> {
    return this.request<any>('/progress/todays-problem');
  }

  async solveTodaysProblem(data: { problemId: string; solution?: string; language?: string; timeSpent?: number; notes?: string }): Promise<any> {
    return this.request<any>('/progress/todays-problem/solve', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProblemSubmissions(problemId: string): Promise<any> {
    return this.request<any>(`/progress/problem-submissions/${problemId}`);
  }

  async sendEmailNotification(data: { to: string; subject: string; body: string }): Promise<any> {
    console.log('📤 API: sendEmailNotification called with data:', data);
    console.log('📧 Email will be sent TO:', data.to);
    
    const result = await this.request<any>('/send-email', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    console.log('📬 API: Email notification result:', result);
    return result;
  }

  // Task-related API methods
  async getTasks(): Promise<any[]> {
    return await this.request<any[]>('/tasks');
  }

  async createTask(taskData: {
    title: string;
    description?: string;
    category: 'study' | 'practice' | 'interview' | 'review' | 'other';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    deadline: string;
    estimatedTime?: number;
    subtasks?: { text: string; done: boolean }[];
    link?: string;
    tags?: string[];
  }): Promise<any> {
    return await this.request<any>('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  }

  async updateTask(taskId: string, updates: any): Promise<any> {
    return await this.request<any>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string): Promise<any> {
    return await this.request<any>(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  async completeTask(taskId: string, completionData: {
    timeSpent?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    notes?: string;
  }): Promise<any> {
    return await this.request<any>(`/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify(completionData),
    });
  }

  async incompleteTask(taskId: string): Promise<any> {
    return await this.request<any>(`/tasks/${taskId}/incomplete`, {
      method: 'PATCH',
    });
  }

  async markNotificationSent(taskId: string): Promise<any> {
    return await this.request<any>(`/tasks/${taskId}/notification-sent`, {
      method: 'PATCH',
    });
  }

  // ============ Topics / Content ============

  async getTopics(): Promise<any[]> {
    return await this.request<any[]>('/topics');
  }

  async getTopic(slug: string): Promise<any> {
    return await this.request<any>(`/topics/${slug}`);
  }

  async createTopic(data: any): Promise<any> {
    return await this.request<any>('/topics', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTopic(id: string, data: any): Promise<any> {
    return await this.request<any>(`/topics/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTopic(id: string): Promise<any> {
    return await this.request<any>(`/topics/${id}`, { method: 'DELETE' });
  }

  async getMCQs(topicSlug: string): Promise<any[]> {
    return await this.request<any[]>(`/topics/${topicSlug}/mcqs`);
  }

  async createMCQ(topicSlug: string, data: any): Promise<any> {
    return await this.request<any>(`/topics/${topicSlug}/mcqs`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateMCQ(id: string, data: any): Promise<any> {
    return await this.request<any>(`/topics/mcqs/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteMCQ(id: string): Promise<any> {
    return await this.request<any>(`/topics/mcqs/${id}`, { method: 'DELETE' });
  }

  async getInterviewQuestions(topicSlug: string): Promise<any[]> {
    return await this.request<any[]>(`/topics/${topicSlug}/interview-questions`);
  }

  async createInterviewQuestion(topicSlug: string, data: any): Promise<any> {
    return await this.request<any>(`/topics/${topicSlug}/interview-questions`, { method: 'POST', body: JSON.stringify(data) });
  }

  async updateInterviewQuestion(id: string, data: any): Promise<any> {
    return await this.request<any>(`/topics/interview-questions/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteInterviewQuestion(id: string): Promise<any> {
    return await this.request<any>(`/topics/interview-questions/${id}`, { method: 'DELETE' });
  }

  // ============ Progress Tracking (Quiz / Articles / Interview) ============

  async saveQuizScore(data: { topicSlug: string; score: number; totalQuestions: number }): Promise<any> {
    return await this.request<any>('/progress/quiz-score', { method: 'POST', body: JSON.stringify(data) });
  }

  async markArticleRead(data: { topicSlug: string; subtopicId: string }): Promise<any> {
    return await this.request<any>('/progress/article-read', { method: 'PATCH', body: JSON.stringify(data) });
  }

  async markInterviewViewed(data: { topicSlug: string; count: number }): Promise<any> {
    return await this.request<any>('/progress/interview-viewed', { method: 'PATCH', body: JSON.stringify(data) });
  }
}

export const apiService = new ApiService(); 