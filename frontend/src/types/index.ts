export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  groupId?: string;
  timestamp: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message:string;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}
