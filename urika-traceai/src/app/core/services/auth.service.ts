import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, JwtResponse } from '../models/auth.model'; // <-- Correction du chemin relatif

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  // Port 8088 qui correspond bien à ton architecture Spring Boot
  private apiUrl = 'http://localhost:8088/api/auth'; 

  login(credentials: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        // Sauvegarde locale du token et du profil utilisateur
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('auth_user', response.username);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getCurrentUser(): string | null {
    return localStorage.getItem('auth_user');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}