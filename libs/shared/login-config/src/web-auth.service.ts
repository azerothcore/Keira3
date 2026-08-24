import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export const KEIRA_AUTH_API_URL = '/api/auth';

@Injectable({ providedIn: 'root' })
export class WebAuthService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${KEIRA_AUTH_API_URL}/login`, { username, password });
  }

  logout(): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(`${KEIRA_AUTH_API_URL}/logout`, {});
  }
}
