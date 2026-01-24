/**
 * Types for Auth feature
 */

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
}

export interface LoginViewModel {
  // Form state
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  
  // Mutation state
  isPending: boolean;
  
  // Handlers
  handleSubmit: (e: React.FormEvent) => void;
  handleNavigateToRegister: () => void;
}

export interface RegisterViewModel {
  // Form state
  fullName: string;
  setFullName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  error: string;
  
  // Mutation state
  isPending: boolean;
  
  // Handlers
  handleSubmit: (e: React.FormEvent) => void;
  handleNavigateToLogin: () => void;
}
