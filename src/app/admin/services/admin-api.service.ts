import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import {
  ApiStrain,
  Article,
  ContentBlock,
  Dispensary,
  GalleryImage,
  MediaItem,
  StorySection,
  StoryStat
} from '../../models/content.model';

/** The repeatable lists the dashboard can manage generically. */
export type CollectionResource =
  | 'dispensaries'
  | 'articles'
  | 'gallery'
  | 'story-sections'
  | 'story-stats';

export type CollectionItem = Dispensary | Article | GalleryImage | StorySection | StoryStat;

/** Typed calls onto the admin half of the API. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly api = inject(ApiService);

  // --- Page content --------------------------------------------------------

  getContent(): Promise<{ sections: string[]; blocks: ContentBlock[] }> {
    return firstValueFrom(this.api.get<{ sections: string[]; blocks: ContentBlock[] }>('/admin/content'));
  }

  saveContent(
    blocks: { key: string; value: string; altText?: string }[]
  ): Promise<{ updated: number; blocks: ContentBlock[] }> {
    return firstValueFrom(
      this.api.put<{ updated: number; blocks: ContentBlock[] }>('/admin/content', { blocks })
    );
  }

  // --- Strains -------------------------------------------------------------

  getStrains(): Promise<ApiStrain[]> {
    return firstValueFrom(this.api.get<ApiStrain[]>('/admin/strains'));
  }

  getStrain(id: number): Promise<ApiStrain> {
    return firstValueFrom(this.api.get<ApiStrain>(`/admin/strains/${id}`));
  }

  createStrain(payload: unknown): Promise<ApiStrain> {
    return firstValueFrom(this.api.post<ApiStrain>('/admin/strains', payload));
  }

  updateStrain(id: number, payload: unknown): Promise<ApiStrain> {
    return firstValueFrom(this.api.put<ApiStrain>(`/admin/strains/${id}`, payload));
  }

  deleteStrain(id: number): Promise<unknown> {
    return firstValueFrom(this.api.delete(`/admin/strains/${id}`));
  }

  reorderStrains(ids: number[]): Promise<unknown> {
    return firstValueFrom(this.api.post('/admin/strains/reorder', { ids: ids.map(String) }));
  }

  // --- Generic collections -------------------------------------------------

  getCollection<T>(resource: CollectionResource): Promise<T[]> {
    return firstValueFrom(this.api.get<T[]>(`/admin/${resource}`));
  }

  createItem<T>(resource: CollectionResource, payload: unknown): Promise<T> {
    return firstValueFrom(this.api.post<T>(`/admin/${resource}`, payload));
  }

  updateItem<T>(resource: CollectionResource, id: number, payload: unknown): Promise<T> {
    return firstValueFrom(this.api.put<T>(`/admin/${resource}/${id}`, payload));
  }

  deleteItem(resource: CollectionResource, id: number): Promise<unknown> {
    return firstValueFrom(this.api.delete(`/admin/${resource}/${id}`));
  }

  reorderItems(resource: CollectionResource, ids: number[]): Promise<unknown> {
    return firstValueFrom(this.api.post(`/admin/${resource}/reorder`, { ids: ids.map(String) }));
  }

  // --- Media ---------------------------------------------------------------

  getMedia(): Promise<MediaItem[]> {
    return firstValueFrom(this.api.get<MediaItem[]>('/admin/media'));
  }

  uploadImage(file: File, altText: string): Promise<MediaItem> {
    const form = new FormData();
    form.append('file', file);
    form.append('altText', altText);
    return firstValueFrom(this.api.upload<MediaItem>('/admin/media', form));
  }

  updateMediaAlt(id: number, altText: string): Promise<MediaItem> {
    return firstValueFrom(this.api.put<MediaItem>(`/admin/media/${id}`, { altText }));
  }

  /** `force` deletes even when the image is still referenced somewhere. */
  deleteMedia(id: number, force = false): Promise<unknown> {
    return firstValueFrom(this.api.delete(`/admin/media/${id}`, force ? { force: 'true' } : undefined));
  }
}
