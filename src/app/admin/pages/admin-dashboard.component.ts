import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../services/admin-api.service';
import { AdminAuthService } from '../services/admin-auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="admin__page-header">
      <div>
        <h1 class="admin__title">Welcome back</h1>
        <p class="admin__subtitle">
          Everything you change here goes live on the website straight away — visitors see it the
          next time they load a page. There is nothing else to publish or upload.
        </p>
      </div>
    </header>

    @if (loading()) {
      <p class="admin__loading"><span class="admin__spinner"></span> Loading…</p>
    } @else {
      <div class="admin__tiles">
        <a routerLink="/admin/strains" class="admin__tile">
          <p class="admin__tile-count">{{ counts().strains }}</p>
          <p class="admin__tile-label">Strains</p>
          <p class="admin__tile-hint">Add, edit and reorder the products in the menu</p>
        </a>

        <a routerLink="/admin/lists/dispensaries" class="admin__tile">
          <p class="admin__tile-count">{{ counts().dispensaries }}</p>
          <p class="admin__tile-label">Dispensaries</p>
          <p class="admin__tile-hint">Shops listed on the Story page</p>
        </a>

        <a routerLink="/admin/lists/gallery" class="admin__tile">
          <p class="admin__tile-count">{{ counts().gallery }}</p>
          <p class="admin__tile-label">Gallery photos</p>
          <p class="admin__tile-hint">The photo strip on the home page</p>
        </a>

        <a routerLink="/admin/lists/articles" class="admin__tile">
          <p class="admin__tile-count">{{ counts().articles }}</p>
          <p class="admin__tile-label">Articles</p>
          <p class="admin__tile-hint">Field notes shown on the home page</p>
        </a>
      </div>

      <div class="admin__card" style="margin-top: 1.5rem">
        <h2 class="admin__card-title">What you can change</h2>
        <ul style="list-style: none; display: grid; gap: 0.6rem; font-size: 0.875rem">
          <li><strong>Strains</strong> — add, edit, reorder and hide products, with their photos and formats.</li>
          <li><strong>Gallery</strong> — the photo strip on the home page.</li>
          <li><strong>Articles</strong> — the field notes cards.</li>
          <li><strong>Dispensaries</strong> — shops on the Story page. The count updates itself.</li>
          <li><strong>Story page</strong> — the picture-and-text rows and the three statistics.</li>
          <li><strong>Messages</strong> — enquiries sent through the contact form.</li>
          <li><strong>Settings</strong> — contact email and the merch store link.</li>
        </ul>
        <p class="admin__help" style="margin-top: 1rem; margin-bottom: 0">
          Headings, menu labels, colours and the legal notice are part of the site's design. Ask
          your developer if any of those need to change.
        </p>
      </div>
    }
  `
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  readonly auth = inject(AdminAuthService);

  readonly loading = signal(true);
  readonly counts = signal({ strains: 0, dispensaries: 0, articles: 0, gallery: 0 });

  ngOnInit(): void {
    void this.loadCounts();
  }

  private async loadCounts(): Promise<void> {
    try {
      const [strains, dispensaries, articles, gallery] = await Promise.all([
        this.adminApi.getStrains(),
        this.adminApi.getCollection('dispensaries'),
        this.adminApi.getCollection('articles'),
        this.adminApi.getCollection('gallery')
      ]);

      this.counts.set({
        strains: strains.length,
        dispensaries: dispensaries.length,
        articles: articles.length,
        gallery: gallery.length
      });
    } catch {
      // Counts are decorative; the rest of the dashboard still works without them.
    } finally {
      this.loading.set(false);
    }
  }
}
