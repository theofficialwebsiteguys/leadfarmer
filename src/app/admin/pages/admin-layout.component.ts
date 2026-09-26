import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';
import { AdminOverlaysComponent } from '../components/admin-overlays.component';

/**
 * The dashboard shell: sidebar navigation, the signed-in user, and the outlet
 * every admin screen renders into.
 *
 * Navigation is grouped the way the client thinks about the site — "Pages"
 * mirrors what they see in the main menu, "Content lists" is the repeatable
 * stuff, and settings-ish items sit at the bottom.
 */
@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AdminOverlaysComponent],
  template: `
    <div class="admin">
      <div class="admin__shell">
        <aside class="admin__sidebar">
          <div class="admin__brand">
            <img src="assets/brand/brand-head.png" alt="" class="admin__brand-logo">
            <span class="admin__brand-text">Lead Farmer</span>
          </div>

          <nav aria-label="Dashboard sections">
            <a
              routerLink="/admin"
              [routerLinkActiveOptions]="{ exact: true }"
              routerLinkActive="admin__nav-link--active"
              class="admin__nav-link"
            >Overview</a>

            <p class="admin__nav-group-label">Content</p>
            <a routerLink="/admin/strains" routerLinkActive="admin__nav-link--active" class="admin__nav-link">Strains</a>
            @for (list of contentLists; track list.resource) {
              <a
                [routerLink]="['/admin/lists', list.resource]"
                routerLinkActive="admin__nav-link--active"
                class="admin__nav-link"
              >{{ list.label }}</a>
            }

            <p class="admin__nav-group-label">Story page</p>
            @for (list of storyLists; track list.resource) {
              <a
                [routerLink]="['/admin/lists', list.resource]"
                routerLinkActive="admin__nav-link--active"
                class="admin__nav-link"
              >{{ list.label }}</a>
            }

            <p class="admin__nav-group-label">Site</p>
            <a routerLink="/admin/messages" routerLinkActive="admin__nav-link--active" class="admin__nav-link">Messages</a>
            <a routerLink="/admin/media" routerLinkActive="admin__nav-link--active" class="admin__nav-link">All images</a>
            <a routerLink="/admin/settings" routerLinkActive="admin__nav-link--active" class="admin__nav-link">Settings</a>
            <a href="/" target="_blank" rel="noopener" class="admin__nav-link">View website &#8599;</a>
          </nav>

          <div class="admin__sidebar-footer">
            <p style="margin-bottom: 0.5rem">
              Signed in as <strong>{{ auth.user()?.username }}</strong>
            </p>
            <button type="button" class="admin__btn admin__btn--secondary admin__btn--small" (click)="signOut()"
              style="border-color: rgba(255,255,255,0.4); color: #fff">
              Sign out
            </button>
          </div>
        </aside>

        <main class="admin__main">
          <router-outlet />
        </main>
      </div>

      <app-admin-overlays />
    </div>
  `
})
export class AdminLayoutComponent {
  readonly auth = inject(AdminAuthService);

  // The things that actually change week to week. Fixed page copy (headings,
  // menu labels, the legal notice) is intentionally not editable here — it is
  // part of the design, lives in the database, and changing it is a developer
  // job rather than something to put in front of the client every day.
  readonly contentLists = [
    { resource: 'gallery', label: 'Gallery' },
    { resource: 'articles', label: 'Articles' },
    { resource: 'dispensaries', label: 'Dispensaries' }
  ];

  readonly storyLists = [
    { resource: 'story-sections', label: 'Sections' },
    { resource: 'story-stats', label: 'Statistics' }
  ];

  signOut(): void {
    void this.auth.logout();
  }
}
