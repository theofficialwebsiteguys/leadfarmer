import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../services/admin-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { ApiStrain } from '../../models/content.model';

@Component({
  selector: 'app-strain-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="admin__page-header">
      <div>
        <h1 class="admin__title">Strains</h1>
        <p class="admin__subtitle">
          Everything in the menu. Drag order is set with the arrows — the order here is the order
          visitors see on the Strains page.
        </p>
      </div>
      <a routerLink="/admin/strains/new" class="admin__btn">Add a strain</a>
    </header>

    @if (loading()) {
      <p class="admin__loading"><span class="admin__spinner"></span> Loading strains…</p>
    } @else if (loadError()) {
      <div class="admin__notice admin__notice--error" role="alert">{{ loadError() }}</div>
    } @else if (strains().length === 0) {
      <div class="admin__empty">
        <p style="margin-bottom: 1rem">No strains yet.</p>
        <a routerLink="/admin/strains/new" class="admin__btn">Add the first one</a>
      </div>
    } @else {
      <ul class="admin__list">
        @for (strain of strains(); track strain.id; let i = $index, first = $first, last = $last) {
          <li class="admin__list-item">
            @if (strain.mainImage?.src) {
              <img [src]="strain.mainImage!.src" [alt]="strain.mainImage!.alt" class="admin__list-thumb">
            } @else {
              <div class="admin__list-thumb"></div>
            }

            <div class="admin__list-main">
              <p class="admin__list-title">
                <a [routerLink]="['/admin/strains', strain.id]">{{ strain.name }}</a>
              </p>
              <p class="admin__list-meta">
                <span>{{ photoCount(strain) }} photo{{ photoCount(strain) === 1 ? '' : 's' }}</span>
                @if (strain.featured) {
                  <span class="admin__badge admin__badge--featured">Home page</span>
                }
                @if (!strain.isPublished) {
                  <span class="admin__badge admin__badge--hidden">Hidden</span>
                }
              </p>
            </div>

            <div class="admin__list-actions">
              <button
                type="button"
                class="admin__btn admin__btn--quiet admin__btn--small"
                [disabled]="first || reordering()"
                (click)="move(i, -1)"
                aria-label="Move up"
                title="Move up"
              >&uarr;</button>
              <button
                type="button"
                class="admin__btn admin__btn--quiet admin__btn--small"
                [disabled]="last || reordering()"
                (click)="move(i, 1)"
                aria-label="Move down"
                title="Move down"
              >&darr;</button>
              <a [routerLink]="['/admin/strains', strain.id]" class="admin__btn admin__btn--secondary admin__btn--small">Edit</a>
              <button
                type="button"
                class="admin__btn admin__btn--danger admin__btn--small"
                (click)="remove(strain)"
              >Delete</button>
            </div>
          </li>
        }
      </ul>
    }
  `
})
export class StrainListComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  photoCount(strain: ApiStrain): number {
    return (strain.mainImage ? 1 : 0) + strain.galleryImages.length + strain.packagingImages.length;
  }

  readonly strains = signal<ApiStrain[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly reordering = signal(false);

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  private async load(): Promise<void> {
    this.loading.set(true);
    this.loadError.set('');

    try {
      this.strains.set(await this.adminApi.getStrains());
    } catch (error) {
      this.loadError.set(error instanceof ApiRequestError ? error.message : 'Could not load strains.');
    } finally {
      this.loading.set(false);
    }
  }

  async move(index: number, direction: 1 | -1): Promise<void> {
    const list = [...this.strains()];
    const target = index + direction;

    if (target < 0 || target >= list.length) {
      return;
    }

    [list[index], list[target]] = [list[target], list[index]];
    this.strains.set(list);

    this.reordering.set(true);
    try {
      await this.adminApi.reorderStrains(list.map(strain => strain.id));
      this.toast.success('Order updated.');
    } catch {
      this.toast.error('Could not save the new order.');
      await this.load();
    } finally {
      this.reordering.set(false);
    }
  }

  async remove(strain: ApiStrain): Promise<void> {
    const confirmed = await this.confirm.askDelete(strain.name);
    if (!confirmed) {
      return;
    }

    try {
      await this.adminApi.deleteStrain(strain.id);
      this.strains.update(list => list.filter(item => item.id !== strain.id));
      this.toast.success(`${strain.name} deleted.`);
    } catch (error) {
      this.toast.error(error instanceof ApiRequestError ? error.message : 'Could not delete that strain.');
    }
  }
}
