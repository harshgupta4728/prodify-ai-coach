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
  leetcodeProfile?: string;
  geeksforgeeksProfile?: string;
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
  leetcodeProfile?: string;
  geeksforgeeksProfile?: string;
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

    if (this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
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
  async signup(data: SignupData): Promise<AuthResponse> {
    console.log('Signup data:', data);
    return this.request<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async signin(data: LoginData): Promise<AuthResponse> {
    console.log('Signin data:', data);
    return this.request<AuthResponse>('/auth/signin', {
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
}

export const apiService = new ApiService(); 