import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { MediaItem } from '../../models/content.model';

/**
 * Reusable image control: preview, upload, choose from the library, edit alt
 * text, clear.
 *
 * Value semantics — `path` is the site-relative path that gets stored in the
 * database (e.g. "/uploads/abc.jpg" or "assets/product/..."), while `previewUrl`
 * is the absolute URL the API returned for display. The component never touches
 * the filesystem; it just hands the server a file and stores the path it gets
 * back.
 */
@Component({
  selector: 'app-image-field',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="admin__field">
      <span class="admin__label">{{ label }}</span>
      @if (helpText) {
        <p class="admin__help">{{ helpText }}</p>
      }

      <div class="admin__image-field">
        @if (previewSrc()) {
          <img [src]="previewSrc()" [alt]="alt || 'Selected image preview'" class="admin__image-preview">
        } @else {
          <div class="admin__image-placeholder">No image selected</div>
        }

        <div class="admin__image-controls">
          <div class="admin__actions" style="margin-bottom: 0.75rem">
            <label class="admin__btn admin__btn--small" [class.admin__btn--secondary]="!!path">
              {{ uploading() ? 'Uploading…' : (path ? 'Replace image' : 'Upload image') }}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                [disabled]="uploading()"
                (change)="onFileSelected($event)"
              >
            </label>

            <button
              type="button"
              class="admin__btn admin__btn--secondary admin__btn--small"
              (click)="toggleLibrary()"
              [disabled]="uploading()"
            >
              {{ libraryOpen() ? 'Hide library' : 'Choose from library' }}
            </button>

            @if (path) {
              <button type="button" class="admin__btn admin__btn--quiet admin__btn--small" (click)="clear()">
                Remove
              </button>
            }
          </div>

          <label class="admin__label" [attr.for]="fieldId + '-alt'">
            Image description (alt text)
          </label>
          <p class="admin__help">
            Describes the picture for screen readers and search engines. Example: “Close-up of MAC1 flower”.
          </p>
          <input
            [id]="fieldId + '-alt'"
            class="admin__input"
            type="text"
            maxlength="500"
            [ngModel]="alt"
            (ngModelChange)="altChange.emit($event)"
            [name]="fieldId + '-alt'"
          >

          @if (error()) {
            <p class="admin__error">{{ error() }}</p>
          }
        </div>
      </div>

      @if (libraryOpen()) {
        <div class="admin__card" style="margin-top: 1rem">
          @if (loadingLibrary()) {
            <p class="admin__loading"><span class="admin__spinner"></span> Loading images…</p>
          } @else if (library().length === 0) {
            <p class="admin__empty">No images uploaded yet. Use “Upload image” above to add one.</p>
          } @else {
            <div class="admin__media-grid">
              @for (item of library(); track item.id) {
                <button
                  type="button"
                  class="admin__media-card"
                  style="text-align: left; cursor: pointer"
                  (click)="pick(item)"
                >
                  <img [src]="item.url" [alt]="item.altText || item.originalName">
                  <span class="admin__media-name">{{ item.originalName || item.filename }}</span>
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ImageFieldComponent {
  private readonly adminApi = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  @Input() label = 'Image';
  @Input() helpText = '';
  /** Site-relative stored path. */
  @Input() path: string | null = null;
  /** Absolute URL for the preview, when the API supplied one. */
  @Input() previewUrl: string | null = null;
  @Input() alt = '';
  @Input() fieldId = 'image';

  @Output() pathChange = new EventEmitter<string>();
  @Output() altChange = new EventEmitter<string>();
  /** Emitted with the absolute URL so parents can keep their preview in sync. */
  @Output() previewUrlChange = new EventEmitter<string>();

  readonly uploading = signal(false);
  readonly libraryOpen = signal(false);
  readonly loadingLibrary = signal(false);
  readonly library = signal<MediaItem[]>([]);
  readonly error = signal('');

  previewSrc(): string | null {
    if (this.previewUrl) {
      return this.previewUrl;
    }
    // Relative paths resolve against the site root, which works in dev and prod.
    return this.path ? (this.path.startsWith('/') ? this.path : '/' + this.path) : null;
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    this.error.set('');
    this.uploading.set(true);

    try {
      const uploaded = await this.adminApi.uploadImage(file, this.alt);
      this.apply(uploaded);
      this.toast.success('Image uploaded.');
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'The upload failed. Please try again.';
      this.error.set(message);
      this.toast.error(message);
    } finally {
      this.uploading.set(false);
      // Let the same file be chosen again after a failure.
      input.value = '';
    }
  }

  async toggleLibrary(): Promise<void> {
    const opening = !this.libraryOpen();
    this.libraryOpen.set(opening);

    if (opening && this.library().length === 0) {
      this.loadingLibrary.set(true);
      try {
        this.library.set(await this.adminApi.getMedia());
      } catch {
        this.toast.error('Could not load the image library.');
      } finally {
        this.loadingLibrary.set(false);
      }
    }
  }

  pick(item: MediaItem): void {
    this.apply(item);
    this.libraryOpen.set(false);
  }

  clear(): void {
    this.path = null;
    this.previewUrl = null;
    this.pathChange.emit('');
    this.previewUrlChange.emit('');
  }

  private apply(item: MediaItem): void {
    this.path = item.path;
    this.previewUrl = item.url;
    this.pathChange.emit(item.path);
    this.previewUrlChange.emit(item.url ?? '');

    // Adopt the library's alt text only when the field is still empty.
    if (!this.alt && item.altText) {
      this.alt = item.altText;
      this.altChange.emit(item.altText);
    }
  }
}
