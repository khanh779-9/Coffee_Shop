import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api.config';
import { AuthSession } from './models';

const STORAGE_KEY = 'coffee-admin-session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<AuthSession | null>(this.readSession());

  readonly session = this.sessionState.asReadonly();
  readonly user = computed(() => this.sessionState()?.user ?? null);
  readonly isAuthenticated = computed(() => !!this.sessionState()?.token);

  login(email: string, password: string): Observable<{ data: AuthSession }> {
    return this.http.post<{ data: AuthSession }>(`${API_BASE_URL}/auth/login`, { email, password }).pipe(
      tap((response) => {
        this.sessionState.set(response.data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(response.data));
      })
    );
  }

  logout(): void {
    this.sessionState.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  authHeaders(): HttpHeaders {
    const token = this.sessionState()?.token;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private readSession(): AuthSession | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as AuthSession;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }
}
