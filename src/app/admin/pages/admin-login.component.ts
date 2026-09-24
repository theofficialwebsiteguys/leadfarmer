import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { ApiRequestError } from '../../services/api.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin admin--login">
      <form class="admin__login-card" (ngSubmit)="submit()" #loginForm="ngForm" novalidate>
        <img src="assets/brand/brand-head.png" alt="Lead Farmer" class="admin__login-logo">

        <h1 class="admin__login-title">Lead Farmer</h1>
        <p class="admin__login-sub">Website content manager</p>

        @if (errorMessage()) {
          <div class="admin__notice admin__notice--error" role="alert">{{ errorMessage() }}</div>
        }

        <div class="admin__field">
          <label class="admin__label" for="username">Username</label>
          <input
            id="username"
            name="username"
            class="admin__input"
            type="text"
            autocomplete="username"
            required
            [(ngModel)]="username"
            [disabled]="submitting()"
          >
        </div>

        <div class="admin__field">
          <label class="admin__label" for="password">Password</label>
          <input
            id="password"
            name="password"
            class="admin__input"
            type="password"
            autocomplete="current-password"
            required
            [(ngModel)]="password"
            [disabled]="submitting()"
          >
        </div>

        <button
          type="submit"
          class="admin__btn"
          style="width: 100%; margin-top: 0.5rem"
          [disabled]="submitting() || !username || !password"
        >
          @if (submitting()) {
            <span class="admin__spinner"></span> Signing in…
          } @else {
            Sign in
          }
        </button>
      </form>
    </div>
  `
})
export class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';

  readonly submitting = signal(false);
  readonly errorMessage = signal('');

  async submit(): Promise<void> {
    if (this.submitting() || !this.username || !this.password) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      await this.auth.login(this.username.trim(), this.password);
      await this.router.navigate(['/admin']);
    } catch (error) {
      // The API deliberately does not say which of the two was wrong.
      this.errorMessage.set(
        error instanceof ApiRequestError ? error.message : 'Sign-in failed. Please try again.'
      );
      this.password = '';
    } finally {
      this.submitting.set(false);
    }
  }
}
