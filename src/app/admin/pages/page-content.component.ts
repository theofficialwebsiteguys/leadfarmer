import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { ContentBlock } from '../../models/content.model';
import { ImageFieldComponent } from '../components/image-field.component';
import { HasUnsavedChanges } from '../services/admin.guards';

/** A block plus the edit state the form needs. */
interface EditableBlock extends ContentBlock {
  originalValue: string;
  originalAlt: string;
  error?: string;
}

/**
 * Edits the non-repeating copy for one page, driven entirely by the rows in
 * content_blocks — labels, help text, grouping and input type all come from the
 * database, so adding a field to the site is a seed change, not a UI change.
 */
@Component({
  selector: 'app-page-content',
  standalone: true,
  imports: [FormsModule, ImageFieldComponent],
  template: `
    <header class="admin__page-header">
      <div>
        <h1 class="admin__title">{{ pageTitle() }}</h1>
        <p class="admin__subtitle">
          A few details that appear across the site. Everything else — headings, menu labels, the
          legal notice — is part of the design and is set by your developer.
        </p>
      </div>
    </header>

    @if (loading()) {
      <p class="admin__loading"><span class="admin__spinner"></span> Loading this page's content…</p>
    } @else if (loadError()) {
      <div class="admin__notice admin__notice--error" role="alert">{{ loadError() }}</div>
    } @else if (groups().length === 0) {
      <p class="admin__empty">There is nothing editable on this page yet.</p>
    } @else {
      @for (group of groups(); track group.label) {
        <section class="admin__card">
          <h2 class="admin__card-title">{{ group.label }}</h2>

          @for (block of group.blocks; track block.key) {
            @if (block.fieldType === 'image') {
              <app-image-field
                [label]="block.fieldLabel"
                [helpText]="block.helpText"
                [path]="block.value"
                [previewUrl]="block.imageUrl"
                [alt]="block.altText"
                [fieldId]="block.key"
                (pathChange)="block.value = $event"
                (previewUrlChange)="block.imageUrl = $event"
                (altChange)="block.altText = $event"
              />
            } @else {
              <div class="admin__field">
                <label class="admin__label" [attr.for]="block.key">{{ block.fieldLabel }}</label>
                @if (block.helpText) {
                  <p class="admin__help">{{ block.helpText }}</p>
                }

                @if (block.fieldType === 'textarea') {
                  <textarea
                    [id]="block.key"
                    [name]="block.key"
                    class="admin__textarea"
                    [(ngModel)]="block.value"
                    [attr.aria-invalid]="block.error ? 'true' : null"
                  ></textarea>
                } @else {
                  <input
                    [id]="block.key"
                    [name]="block.key"
                    class="admin__input"
                    [type]="block.fieldType === 'url' ? 'text' : 'text'"
                    [(ngModel)]="block.value"
                    [attr.aria-invalid]="block.error ? 'true' : null"
                  >
                }

                @if (block.error) {
                  <p class="admin__error">{{ block.error }}</p>
                }
              </div>
            }
          }
        </section>
      }

      <div class="admin__save-bar">
        <span class="admin__dirty-note" [class.admin__dirty-note--dirty]="hasUnsavedChanges()">
          @if (saving()) {
            Saving…
          } @else if (hasUnsavedChanges()) {
            You have unsaved changes
          } @else {
            All changes saved
          }
        </span>

        <div class="admin__actions">
          <button
            type="button"
            class="admin__btn admin__btn--secondary"
            (click)="revert()"
            [disabled]="saving() || !hasUnsavedChanges()"
          >Undo changes</button>

          <button type="button" class="admin__btn" (click)="save()" [disabled]="saving() || !hasUnsavedChanges()">
            @if (saving()) {
              <span class="admin__spinner"></span> Saving…
            } @else {
              Save changes
            }
          </button>
        </div>
      </div>
    }
  `
})
export class PageContentComponent implements OnInit, HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly toast = inject(ToastService);

  private section = '';
  private blocks: EditableBlock[] = [];

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly groups = signal<{ label: string; blocks: EditableBlock[] }[]>([]);
  readonly pageTitle = signal('Page content');

  private readonly titles: Record<string, string> = {
    settings: 'Settings'
  };

  ngOnInit(): void {
    // The section comes from route data (fixed routes like /admin/settings) or
    // from the URL, so the same screen can serve either shape.
    this.route.data.subscribe(data => {
      this.section = (data['section'] as string | undefined) ?? this.route.snapshot.paramMap.get('section') ?? 'settings';
      this.pageTitle.set(this.titles[this.section] ?? 'Settings');
      void this.load();
    });
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');

    try {
      const response = await this.adminApi.getContent();

      this.blocks = response.blocks
        .filter(block => block.section === this.section)
        .map(block => ({ ...block, originalValue: block.value, originalAlt: block.altText }));

      this.rebuildGroups();
    } catch (error) {
      this.loadError.set(
        error instanceof ApiRequestError ? error.message : 'Could not load this page.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  private rebuildGroups(): void {
    const byGroup = new Map<string, EditableBlock[]>();

    for (const block of this.blocks) {
      const label = block.groupLabel || 'General';
      const existing = byGroup.get(label);
      if (existing) {
        existing.push(block);
      } else {
        byGroup.set(label, [block]);
      }
    }

    this.groups.set([...byGroup.entries()].map(([label, blocks]) => ({ label, blocks })));
  }

  hasUnsavedChanges(): boolean {
    return this.blocks.some(
      block => block.value !== block.originalValue || block.altText !== block.originalAlt
    );
  }

  revert(): void {
    for (const block of this.blocks) {
      block.value = block.originalValue;
      block.altText = block.originalAlt;
      block.error = undefined;
    }
    this.rebuildGroups();
  }

  async save(): Promise<void> {
    if (this.saving()) {
      return;
    }

    const changed = this.blocks.filter(
      block => block.value !== block.originalValue || block.altText !== block.originalAlt
    );

    if (changed.length === 0) {
      return;
    }

    this.saving.set(true);
    for (const block of this.blocks) {
      block.error = undefined;
    }

    try {
      await this.adminApi.saveContent(
        changed.map(block => ({ key: block.key, value: block.value, altText: block.altText }))
      );

      for (const block of changed) {
        block.originalValue = block.value;
        block.originalAlt = block.altText;
      }

      this.toast.success(
        changed.length === 1 ? 'Change saved and live on the site.' : `${changed.length} changes saved and live on the site.`
      );
    } catch (error) {
      if (error instanceof ApiRequestError) {
        // Map field errors (keyed blocks.<index>.<field>) back onto inputs.
        for (const [path, message] of Object.entries(error.fields)) {
          const index = Number(path.split('.')[1]);
          const block = changed[index];
          if (block) {
            block.error = message;
          }
        }
        this.toast.error(error.message);
      } else {
        this.toast.error('Could not save. Please try again.');
      }
    } finally {
      this.saving.set(false);
    }
  }
}
