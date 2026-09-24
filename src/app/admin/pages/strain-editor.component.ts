import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../services/admin-api.service';
import { ConfirmService } from '../services/confirm.service';
import { ToastService } from '../services/toast.service';
import { ApiRequestError } from '../../services/api.service';
import { ApiStrain, ApiStrainImage } from '../../models/content.model';
import { ImageFieldComponent } from '../components/image-field.component';
import { HasUnsavedChanges } from '../services/admin.guards';

interface ImageEntry {
  path: string;
  url: string;
  alt: string;
  label: string;
}

/**
 * Editing shape — only the fields the public site renders. Anything a visitor
 * never sees is deliberately absent rather than collected and hidden.
 */
interface StrainForm {
  name: string;
  slug: string;
  shortDescription: string;
  featured: boolean;
  isPublished: boolean;
  releaseDate: string;
  mainImage: ImageEntry;
  galleryImages: ImageEntry[];
  packagingImages: ImageEntry[];
}

@Component({
  selector: 'app-strain-editor',
  standalone: true,
  imports: [FormsModule, RouterLink, ImageFieldComponent],
  templateUrl: './strain-editor.component.html'
})
export class StrainEditorComponent implements OnInit, HasUnsavedChanges {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApiService);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly loadError = signal('');
  readonly isNew = signal(true);
  readonly strainId = signal<number | null>(null);
  readonly fieldErrors = signal<Record<string, string>>({});

  form: StrainForm = this.emptyForm();
  private snapshot = '';

  async ngOnInit(): Promise<void> {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === null || idParam === 'new') {
      this.isNew.set(true);
      this.loading.set(false);
      this.snapshot = JSON.stringify(this.form);
      return;
    }

    this.isNew.set(false);
    this.strainId.set(Number(idParam));

    try {
      const strain = await this.adminApi.getStrain(Number(idParam));
      this.form = this.toForm(strain);
      this.snapshot = JSON.stringify(this.form);
    } catch (error) {
      this.loadError.set(error instanceof ApiRequestError ? error.message : 'Could not load that strain.');
    } finally {
      this.loading.set(false);
    }
  }

  private emptyForm(): StrainForm {
    return {
      name: '',
      slug: '',
      shortDescription: '',
      featured: false,
      isPublished: true,
      releaseDate: '',
      mainImage: { path: '', url: '', alt: '', label: '' },
      galleryImages: [],
      packagingImages: []
    };
  }

  private toForm(strain: ApiStrain): StrainForm {
    const toEntry = (image: ApiStrainImage): ImageEntry => ({
      path: image.path ?? '',
      url: image.src ?? '',
      alt: image.alt ?? '',
      label: image.label ?? ''
    });

    return {
      name: strain.name,
      slug: strain.slug,
      shortDescription: strain.shortDescription,
      featured: strain.featured,
      isPublished: strain.isPublished,
      releaseDate: strain.releaseDate ?? '',
      mainImage: strain.mainImage ? toEntry(strain.mainImage) : { path: '', url: '', alt: '', label: '' },
      galleryImages: strain.galleryImages.map(toEntry),
      packagingImages: strain.packagingImages.map(toEntry)
    };
  }

  private toPayload(): Record<string, unknown> {
    const toImage = (entry: ImageEntry) => ({ src: entry.path, alt: entry.alt, label: entry.label });

    return {
      name: this.form.name,
      slug: this.form.slug,
      shortDescription: this.form.shortDescription,
      featured: this.form.featured,
      isPublished: this.form.isPublished,
      releaseDate: this.form.releaseDate,
      mainImage: toImage(this.form.mainImage),
      galleryImages: this.form.galleryImages.filter(i => i.path).map(toImage),
      packagingImages: this.form.packagingImages.filter(i => i.path).map(toImage)
    };
  }

  hasUnsavedChanges(): boolean {
    return this.snapshot !== '' && JSON.stringify(this.form) !== this.snapshot;
  }

  /** Suggests a web address from the name, for new strains only. */
  onNameChange(): void {
    if (!this.isNew()) {
      return;
    }

    this.form.slug = this.form.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  errorFor(field: string): string | undefined {
    return this.fieldErrors()[field];
  }

  // --- photo list helpers ---------------------------------------------------

  addImage(kind: 'galleryImages' | 'packagingImages'): void {
    this.form[kind].push({ path: '', url: '', alt: '', label: '' });
  }

  removeImage(kind: 'galleryImages' | 'packagingImages', index: number): void {
    this.form[kind].splice(index, 1);
  }

  moveImage(kind: 'galleryImages' | 'packagingImages', index: number, direction: 1 | -1): void {
    const list = this.form[kind];
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
  }

  // --- save / delete --------------------------------------------------------

  async save(): Promise<void> {
    if (this.saving()) {
      return;
    }

    this.saving.set(true);
    this.fieldErrors.set({});

    try {
      const payload = this.toPayload();

      if (this.isNew()) {
        const created = await this.adminApi.createStrain(payload);
        this.toast.success(`${created.name} added and live on the site.`);
        this.snapshot = JSON.stringify(this.form);
        await this.router.navigate(['/admin/strains', created.id]);
      } else {
        const updated = await this.adminApi.updateStrain(this.strainId()!, payload);
        this.form = this.toForm(updated);
        this.snapshot = JSON.stringify(this.form);
        this.toast.success('Saved and live on the site.');
      }
    } catch (error) {
      if (error instanceof ApiRequestError) {
        this.fieldErrors.set(error.fields);
        this.toast.error(error.message);
      } else {
        this.toast.error('Could not save. Please try again.');
      }
    } finally {
      this.saving.set(false);
    }
  }

  async remove(): Promise<void> {
    const id = this.strainId();
    if (id === null) {
      return;
    }

    const confirmed = await this.confirm.askDelete(this.form.name || 'this strain');
    if (!confirmed) {
      return;
    }

    try {
      await this.adminApi.deleteStrain(id);
      this.snapshot = JSON.stringify(this.form); // suppress the unsaved-changes prompt
      this.toast.success('Strain deleted.');
      await this.router.navigate(['/admin/strains']);
    } catch (error) {
      this.toast.error(error instanceof ApiRequestError ? error.message : 'Could not delete that strain.');
    }
  }
}
