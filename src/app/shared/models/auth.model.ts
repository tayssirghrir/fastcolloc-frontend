export type UserRole = 'ETUDIANT' | 'TRAVAILLEUR' | 'ADMIN';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  role: 'ETUDIANT' | 'TRAVAILLEUR' | 'ADMIN';
}
