import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { AdminApiService, CollectionResource } from '../services/admin-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { ImageFieldComponent } from '../components/image-field.component';
import { COLLECTION_CONFIGS, CollectionConfig } from './collection-config';
import { HasUnsavedChanges } from '../services/admin.guards';

type Row = Record<string, any>;

/**
 * One screen that manages any of the simple repeatable lists — list, add, edit,
 * delete and reorder — driven by COLLECTION_CONFIGS rather than per-list code.
 *
 * Editing happens inline: clicking Edit expands the row into a form, which keeps
 * the client in one place instead of bouncing between list and detail pages for
 * what are mostly two- or three-field records.
 */
@Component({
  selector: 'app-collection-manager',
  standalone: true,
  imports: [FormsModule, NgTemplateOutlet, ImageFieldComponent],
  templateUrl: './collection-manager.component.html'
})
export class CollectionManagerComponent implements OnInit, HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly adminApi = inject(AdminApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly config = signal<CollectionConfig | null>(null);
  readonly rows = signal<Row[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly savingId = signal<number | 'new' | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  /** id of the row being edited, or 'new' while adding. */
  readonly editingId = signal<number | 'new' | null>(null);
  draft: Row = {};

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const resource = params.get('resource') as CollectionResource | null;
      const config = resource ? COLLECTION_CONFIGS[resource] : undefined;

      if (!config) {
        this.loadError.set('Unknown list.');
        this.loading.set(false);
        return;
      }

      this.config.set(config);
      this.editingId.set(null);
      void this.load();
    });
  }

  private async load(): Promise<void> {
    const config = this.config();
    if (!config) return;

    this.loading.set(true);
    this.loadError.set('');

    try {
      this.rows.set(await this.adminApi.getCollection(config.resource));
    } catch (error) {
      this.loadError.set(error instanceof ApiRequestError ? error.message : 'Could not load this list.');
    } finally {
      this.loading.set(false);
    }
  }

  hasUnsavedChanges(): boolean {
    return this.editingId() !== null;
  }

  // --- editing --------------------------------------------------------------

  startAdd(): void {
    const config = this.config();
    if (!config) return;

    this.fieldErrors.set({});
    this.draft = { ...config.blank };
    this.editingId.set('new');
  }

  startEdit(row: Row): void {
    this.fieldErrors.set({});
    this.draft = { ...row };
    this.editingId.set(row['id'] as number);
  }

  async cancelEdit(): Promise<void> {
    this.editingId.set(null);
    this.fieldErrors.set({});
  }

  async save(): Promise<void> {
    const config = this.config();
    const editing = this.editingId();
    if (!config || editing === null || this.savingId() !== null) {
      return;
    }

    this.savingId.set(editing);
    this.fieldErrors.set({});

    try {
      if (editing === 'new') {
        const created = await this.adminApi.createItem<Row>(config.resource, this.draft);
        this.rows.update(list => [...list, created]);
        this.toast.success(`New ${config.singular} added and live on the site.`);
      } else {
        const updated = await this.adminApi.updateItem<Row>(config.resource, editing, this.draft);
        this.rows.update(list => list.map(row => (row['id'] === editing ? updated : row)));
        this.toast.success('Saved and live on the site.');
      }

      this.editingId.set(null);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        this.fieldErrors.set(error.fields);
        this.toast.error(error.message);
      } else {
        this.toast.error('Could not save. Please try again.');
      }
    } finally {
      this.savingId.set(null);
    }
  }

  async remove(row: Row): Promise<void> {
    const config = this.config();
    if (!config) return;

    const label = String(row[config.titleField] ?? `this ${config.singular}`);
    const confirmed = await this.confirm.askDelete(label);
    if (!confirmed) {
      return;
    }

    try {
      await this.adminApi.deleteItem(config.resource, row['id'] as number);
      this.rows.update(list => list.filter(item => item['id'] !== row['id']));
      this.toast.success(`${label} deleted.`);
    } catch (error) {
      this.toast.error(error instanceof ApiRequestError ? error.message : 'Could not delete that item.');
    }
  }

  async move(index: number, direction: 1 | -1): Promise<void> {
    const config = this.config();
    if (!config) return;

    const list = [...this.rows()];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;

    [list[index], list[target]] = [list[target], list[index]];
    this.rows.set(list);

    try {
      await this.adminApi.reorderItems(config.resource, list.map(row => row['id'] as number));
      this.toast.success('Order updated.');
    } catch {
      this.toast.error('Could not save the new order.');
      await this.load();
    }
  }

  // --- template helpers -----------------------------------------------------

  errorFor(key: string): string | undefined {
    return this.fieldErrors()[key];
  }

  metaText(row: Row, key: string): string {
    const value = row[key];
    return value === null || value === undefined || value === '' ? '' : String(value);
  }

  /** Row heading, falling back when the title field is an optional one. */
  rowTitle(row: Row): string {
    const config = this.config();
    if (!config) return '';

    return (
      this.metaText(row, config.titleField) ||
      (config.titleFallbackField ? this.metaText(row, config.titleFallbackField) : '') ||
      '(untitled)'
    );
  }

  isHidden(row: Row): boolean {
    return row['isPublished'] === false;
  }
}
