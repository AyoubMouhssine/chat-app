export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface Message {
  id?: number;       
  message: string;   
  senderId: number;   
  receiverId?: number; 
  groupId?: number;  
  sentAt: string; 
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


export interface Group {
  id: number;
  name: string;
  created_by: string;
  members: User[];
  description:string;
}