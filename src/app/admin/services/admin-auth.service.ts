import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AdminUser, SessionState } from '../../models/content.model';

/**
 * Tracks who is signed in, and keeps the CSRF token in sync with ApiService.
 *
 * This is convenience state for the UI only. The server re-checks the session
 * cookie on every single admin request — signing out here, or tampering with
 * these signals, does not grant or remove any actual access.
 */
@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  private readonly currentUser = signal<AdminUser | null>(null);
  private readonly checked = signal(false);

  readonly user = this.currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly hasChecked = this.checked.asReadonly();

  /** Asks the server who we are. Also (re)issues the CSRF token. */
  async refreshSession(): Promise<boolean> {
    try {
      const session = await firstValueFrom(this.api.get<SessionState>('/auth/session'));
      this.api.setCsrfToken(session.csrfToken);
      this.currentUser.set(session.authenticated ? session.user : null);
      return session.authenticated;
    } catch {
      this.currentUser.set(null);
      return false;
    } finally {
      this.checked.set(true);
    }
  }

  async login(username: string, password: string): Promise<void> {
    // A CSRF token is required even to log in, so make sure we hold one first.
    if (!this.api.getCsrfToken()) {
      await this.refreshSession();
    }

    const result = await firstValueFrom(
      this.api.post<{ user: AdminUser; csrfToken: string }>('/auth/login', { username, password })
    );

    this.api.setCsrfToken(result.csrfToken);
    this.currentUser.set(result.user);
    this.checked.set(true);
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.post('/auth/logout', {}));
    } finally {
      // Clear locally even if the request failed — the cookie may already be gone.
      this.currentUser.set(null);
      await this.refreshSession();
      await this.router.navigate(['/admin/login']);
    }
  }
}
