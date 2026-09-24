import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { MediaItem } from '../../models/content.model';

@Component({
  selector: 'app-media-library',
  standalone: true,
  imports: [FormsModule],
  template: `
    <header class="admin__page-header">
      <div>
        <h1 class="admin__title">Images</h1>
        <p class="admin__subtitle">
          Every photo you have uploaded. You can also upload straight from a strain or page, so most
          of the time you will not need to come here.
        </p>
      </div>
      <label class="admin__btn">
        {{ uploading() ? 'Uploading…' : 'Upload images' }}
        <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden [disabled]="uploading()" (change)="upload($event)">
      </label>
    </header>

    <div class="admin__notice">
      JPG, PNG and WebP only, up to 8&nbsp;MB each. Photos are saved on your hosting and keep working
      when the website is updated.
    </div>

    @if (loading()) {
      <p class="admin__loading"><span class="admin__spinner"></span> Loading images…</p>
    } @else if (loadError()) {
      <div class="admin__notice admin__notice--error" role="alert">{{ loadError() }}</div>
    } @else if (items().length === 0) {
      <p class="admin__empty">No images uploaded yet.</p>
    } @else {
      <div class="admin__media-grid">
        @for (item of items(); track item.id) {
          <div class="admin__media-card">
            <img [src]="item.url" [alt]="item.altText || item.originalName">
            <p class="admin__media-name">{{ item.originalName || item.filename }}</p>
            <p class="admin__media-name">{{ item.width }}×{{ item.height }} · {{ sizeLabel(item) }}</p>

            <label class="admin__label" [attr.for]="'alt-' + item.id">Description</label>
            <input
              [id]="'alt-' + item.id"
              class="admin__input"
              style="font-size: 0.8rem; padding: 0.35rem 0.5rem"
              [ngModel]="item.altText"
              [name]="'alt-' + item.id"
              (ngModelChange)="onAltChange(item, $event)"
              (blur)="saveAlt(item)"
              placeholder="Describe this image"
            >

            <div class="admin__actions" style="margin-top: 0.5rem">
              <button type="button" class="admin__btn admin__btn--quiet admin__btn--small" (click)="copyPath(item)">
                Copy path
              </button>
              <button type="button" class="admin__btn admin__btn--danger admin__btn--small" (click)="remove(item)">
                Delete
              </button>
            </div>
          </div>
        }
      </div>
    }
  `
})
export class MediaLibraryComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly items = signal<MediaItem[]>([]);
  readonly loading = signal(true);
  readonly uploading = signal(false);
  readonly loadError = signal('');

  private readonly pendingAlt = new Map<number, string>();

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');

    try {
      this.items.set(await this.adminApi.getMedia());
    } catch (error) {
      this.loadError.set(error instanceof ApiRequestError ? error.message : 'Could not load the image library.');
    } finally {
      this.loading.set(false);
    }
  }

  async upload(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) {
      return;
    }

    this.uploading.set(true);
    let succeeded = 0;

    for (const file of files) {
      try {
        const item = await this.adminApi.uploadImage(file, '');
        this.items.update(list => [item, ...list]);
        succeeded++;
      } catch (error) {
        const message = error instanceof ApiRequestError ? error.message : 'Upload failed.';
        this.toast.error(`${file.name}: ${message}`);
      }
    }

    if (succeeded > 0) {
      this.toast.success(succeeded === 1 ? 'Image uploaded.' : `${succeeded} images uploaded.`);
    }

    this.uploading.set(false);
    input.value = '';
  }

  onAltChange(item: MediaItem, value: string): void {
    this.pendingAlt.set(item.id, value);
  }

  async saveAlt(item: MediaItem): Promise<void> {
    const value = this.pendingAlt.get(item.id);
    if (value === undefined || value === item.altText) {
      return;
    }

    try {
      const updated = await this.adminApi.updateMediaAlt(item.id, value);
      this.items.update(list => list.map(existing => (existing.id === item.id ? updated : existing)));
      this.pendingAlt.delete(item.id);
      this.toast.success('Description saved.');
    } catch {
      this.toast.error('Could not save that description.');
    }
  }

  async copyPath(item: MediaItem): Promise<void> {
    try {
      await navigator.clipboard.writeText(item.path);
      this.toast.success('Path copied to the clipboard.');
    } catch {
      this.toast.error('Could not copy. You can select and copy the path manually.');
    }
  }

  async remove(item: MediaItem): Promise<void> {
    const confirmed = await this.confirm.askDelete(item.originalName || item.filename);
    if (!confirmed) {
      return;
    }

    try {
      await this.adminApi.deleteMedia(item.id);
      this.items.update(list => list.filter(existing => existing.id !== item.id));
      this.toast.success('Image deleted.');
      return;
    } catch (error) {
      // The API refuses to delete an image the site still points at, and tells
      // us where it is used so the client can make an informed choice.
      if (error instanceof ApiRequestError && error.code === 'media_in_use') {
        const usages = error.fields['usages'] ?? 'somewhere on the site';
        const forced = await this.confirm.ask({
          title: 'This image is still in use',
          message: `It is currently used by: ${usages}. Deleting it will leave a broken image there. Delete anyway?`,
          confirmLabel: 'Delete anyway',
          cancelLabel: 'Keep it',
          destructive: true
        });

        if (!forced) {
          return;
        }

        try {
          await this.adminApi.deleteMedia(item.id, true);
          this.items.update(list => list.filter(existing => existing.id !== item.id));
          this.toast.success('Image deleted.');
        } catch {
          this.toast.error('Could not delete that image.');
        }
        return;
      }

      this.toast.error('Could not delete that image.');
    }
  }

  sizeLabel(item: MediaItem): string {
    const kb = item.sizeBytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
  }
}
