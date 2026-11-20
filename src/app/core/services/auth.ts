import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import {
  LoginRequest,
  RegisterRequest,
  AuthResponse
} from '../../shared/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = '/api/auth';
  private sessionSubject = new BehaviorSubject<boolean>(this.hasToken());
  readonly session$ = this.sessionSubject.asObservable();
  private roleSubject = new BehaviorSubject<string | null>(this.readStoredRole());
  readonly role$ = this.roleSubject.asObservable();

  private hasToken(): boolean {
    return typeof localStorage !== 'undefined' && !!localStorage.getItem('token');
  }

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      data
    ).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
        this.sessionSubject.next(true);
        this.roleSubject.next(response.role);
      })
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.sessionSubject.next(false);
    this.roleSubject.next(null);
  }

  isLoggedIn(): boolean {
    return this.hasToken();
  }

  getRole(): string | null {
    return this.readStoredRole();
  }

  private readStoredRole(): string | null {
    const storedRole = typeof localStorage !== 'undefined' ? localStorage.getItem('role') : null;
    if (storedRole) return storedRole;
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      const authority = payload.authorities?.[0]?.authority ?? payload.role ?? payload.roles?.[0];
      return typeof authority === 'string' ? authority.replace(/^ROLE_/, '') : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
