import { Injectable } from '@angular/core';
import { Strain, StrainImage } from '../models/strain.model';
import { STRAINS } from '../data/strains.data';

export type SortOption = 'featured' | 'newest' | 'az';

export interface CatalogQuery {
  types: string[];
  formats: string[];
  badges: string[];
  search: string;
  sort: SortOption;
}

export interface FacetOption {
  value: string;
  count: number;
}

export interface CatalogFacets {
  classifications: FacetOption[];
  formats: FacetOption[];
  badges: FacetOption[];
}

// Static data today; swap the STRAINS import for an HTTP/CMS call later without
// touching any component — every method here can become async at that point.
@Injectable({ providedIn: 'root' })
export class StrainsService {
  private readonly strains: Strain[] = STRAINS;

  getAll(): readonly Strain[] {
    return this.strains;
  }

  getBySlug(slug: string): Strain | undefined {
    return this.strains.find(strain => strain.slug === slug);
  }

  getAllImages(strain: Strain): StrainImage[] {
    return [strain.mainImage, ...(strain.galleryImages ?? []), ...(strain.packagingImages ?? [])];
  }

  getFacets(): CatalogFacets {
    return {
      classifications: this.countBy(strain => [strain.classification]),
      formats: this.countBy(strain => strain.formats.map(format => format.name)),
      badges: this.countBy(strain => strain.badges ?? [])
    };
  }

  query(q: Partial<CatalogQuery>): readonly Strain[] {
    const types = q.types?.length ? new Set(q.types) : null;
    const formats = q.formats?.length ? new Set(q.formats) : null;
    const badges = q.badges?.length ? new Set(q.badges) : null;
    const search = q.search?.trim().toLowerCase() ?? '';

    const results = this.strains.filter(strain => {
      if (types && !types.has(strain.classification)) return false;
      if (formats && !strain.formats.some(format => formats.has(format.name))) return false;
      if (badges && !(strain.badges ?? []).some(badge => badges.has(badge))) return false;
      if (search && !strain.name.toLowerCase().includes(search)) return false;
      return true;
    });

    const sort = q.sort ?? 'featured';
    return results.sort((a, b) => this.compare(a, b, sort));
  }

  getRelated(strain: Strain, max = 4): Strain[] {
    const bySlug = new Map(this.strains.map(s => [s.slug, s]));
    const seen = new Set<string>([strain.slug]);
    const picked: Strain[] = [];

    for (const slug of strain.relatedStrainSlugs ?? []) {
      if (picked.length >= max) break;
      const match = bySlug.get(slug);
      if (match && !seen.has(match.slug)) {
        picked.push(match);
        seen.add(match.slug);
      }
    }

    // Fills any remaining slots by shared classification/format/badge, so the section
    // stays populated even if relatedStrainSlugs is short or a linked strain is removed.
    for (const candidate of this.strains) {
      if (picked.length >= max) break;
      if (seen.has(candidate.slug)) continue;

      const sharesType = candidate.classification === strain.classification;
      const sharesFormat = candidate.formats.some(format => strain.formats.some(sf => sf.name === format.name));
      const sharesBadge = (candidate.badges ?? []).some(badge => (strain.badges ?? []).includes(badge));

      if (sharesType || sharesFormat || sharesBadge) {
        picked.push(candidate);
        seen.add(candidate.slug);
      }
    }

    return picked;
  }

  private compare(a: Strain, b: Strain, sort: SortOption): number {
    if (sort === 'az') return a.name.localeCompare(b.name);
    if (sort === 'newest') return (b.releaseDate ?? '').localeCompare(a.releaseDate ?? '');

    const featuredRank = (strain: Strain) => (strain.featured ? 0 : 1);
    const rankDiff = featuredRank(a) - featuredRank(b);
    return rankDiff !== 0 ? rankDiff : this.strains.indexOf(a) - this.strains.indexOf(b);
  }

  private countBy(getValues: (strain: Strain) => string[]): FacetOption[] {
    const counts = new Map<string, number>();
    for (const strain of this.strains) {
      for (const value of getValues(strain)) {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value));
  }
}
