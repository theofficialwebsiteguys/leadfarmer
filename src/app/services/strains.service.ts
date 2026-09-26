import { Injectable, inject } from '@angular/core';
import { Strain, StrainImage } from '../models/strain.model';
import { ContentStore } from './content-store.service';

export type SortOption = 'featured' | 'newest' | 'az';

// Reads from ContentStore, which is filled from the API before the app renders
// (see app.config.ts). Keeping these methods synchronous is what lets the
// catalog/detail components stay simple.
@Injectable({ providedIn: 'root' })
export class StrainsService {
  private readonly store = inject(ContentStore);

  private get strains(): readonly Strain[] {
    return this.store.strains;
  }

  getAll(sort: SortOption = 'featured'): readonly Strain[] {
    return [...this.strains].sort((a, b) => this.compare(a, b, sort));
  }

  getBySlug(slug: string): Strain | undefined {
    return this.strains.find(strain => strain.slug === slug);
  }

  /**
   * The strains ticked as featured in the admin panel — what the home page
   * shows. Returns an empty list when nothing is featured, and the home page
   * hides the section rather than rendering an empty grid, so the client sees
   * the consequence of unticking everything immediately.
   */
  getFeatured(): readonly Strain[] {
    return this.strains.filter(strain => strain.featured);
  }

  getAllImages(strain: Strain): StrainImage[] {
    return [strain.mainImage, ...(strain.galleryImages ?? []), ...(strain.packagingImages ?? [])];
  }

  /**
   * A random handful of other products for the "keep exploring" strip at the
   * bottom of a strain page.
   *
   * Deliberately not curated in the admin panel: picking four related strains by
   * hand for every product is busywork that goes stale as soon as the menu
   * changes. A fresh random set each page load also makes the rest of the
   * catalog more discoverable.
   */
  getOtherProducts(current: Strain, max = 4): Strain[] {
    const others = this.strains.filter(strain => strain.slug !== current.slug);

    // Fisher–Yates on a copy — never mutate the store's array.
    const shuffled = [...others];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, max);
  }

  private compare(a: Strain, b: Strain, sort: SortOption): number {
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'newest') return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');

    // 'featured': featured strains first, otherwise the order set in the admin panel.
    const featuredRank = (strain: Strain) => (strain.featured ? 0 : 1);
    const rankDiff = featuredRank(a) - featuredRank(b);
    return rankDiff !== 0 ? rankDiff : this.strains.indexOf(a) - this.strains.indexOf(b);
  }
}
