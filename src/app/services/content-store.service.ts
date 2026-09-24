import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from './api.service';
import {
  ApiStrain,
  Article,
  ContentImage,
  Dispensary,
  DispensaryRegionGroup,
  GalleryImage,
  SiteContent,
  StorySection,
  StoryStat
} from '../models/content.model';
import { Strain, StrainImage } from '../models/strain.model';
import { STRAINS } from '../data/strains.data';
import { DISPENSARY_REGIONS } from '../data/dispensaries.data';
import { ARTICLES, STORY_SECTIONS, STORY_STATS } from '../data/site-content.data';

/**
 * Holds the site's content for the lifetime of the page.
 *
 * It is filled once, before the app renders, by the initializer in app.config.ts.
 * That is deliberate: every public component reads content synchronously, so
 * moving from bundled data to the API required no template rewrites and no
 * loading states on the public site.
 *
 * Freshness: the content is fetched on each page load with `Cache-Control:
 * no-cache` and the API answers `no-store`, so a client edit shows up on the
 * visitor's next page load with no Angular rebuild. It is intentionally *not*
 * re-fetched mid-session — content does not change under a visitor's feet.
 *
 * Resilience: if the API is unreachable, the store falls back to the data files
 * that ship in the bundle, so the site keeps rendering instead of going blank.
 */
@Injectable({ providedIn: 'root' })
export class ContentStore {
  private readonly api = inject(ApiService);

  private text_: Record<string, string> = {};
  private images_: Record<string, ContentImage> = {};
  private strains_: Strain[] = [];
  private dispensaries_: Dispensary[] = [];
  private articles_: Article[] = [];
  private gallery_: GalleryImage[] = [];
  private storySections_: StorySection[] = [];
  private storyStats_: StoryStat[] = [];

  /** False when the API could not be reached and bundled fallbacks are in use. */
  private live = false;

  async load(): Promise<void> {
    try {
      const site = await firstValueFrom(this.api.get<SiteContent>('/public/site'));
      this.applySiteContent(site);
      this.live = true;
    } catch {
      // The site must still render if the API or database is down.
      this.applyBundledFallback();
      this.live = false;
    }
  }

  /** Re-fetches from the API — used by the admin panel's "preview" refresh. */
  async reload(): Promise<void> {
    await this.load();
  }

  private applySiteContent(site: SiteContent): void {
    this.text_ = site.content ?? {};
    this.images_ = site.images ?? {};
    this.strains_ = (site.strains ?? []).map(strain => this.toStrain(strain));
    this.dispensaries_ = site.dispensaries ?? [];
    this.articles_ = site.articles ?? [];
    this.gallery_ = site.gallery ?? [];
    this.storySections_ = site.storySections ?? [];
    this.storyStats_ = site.storyStats ?? [];
  }

  /**
   * The content that shipped in the bundle, used only when the API is down.
   * Page copy falls back to the defaults passed at each call site, so a missing
   * key renders the original wording rather than an empty element.
   */
  private applyBundledFallback(): void {
    this.text_ = {};
    this.images_ = {};
    this.strains_ = [...STRAINS];
    this.articles_ = [...ARTICLES];
    this.storySections_ = [...STORY_SECTIONS];

    // Same derivation the database seed uses: every strain photo in order, the
    // first of each strain captioned with the strain name.
    this.gallery_ = this.strains_.flatMap((strain, strainIndex) =>
      [strain.mainImage, ...(strain.galleryImages ?? []), ...(strain.packagingImages ?? [])].map(
        (photo, index) => ({
          id: strainIndex * 1000 + index,
          imageSrc: photo.src,
          imageAlt: photo.alt,
          imageUrl: photo.src,
          caption: index === 0 ? strain.name : null,
          sortOrder: index,
          isPublished: true
        })
      )
    );

    this.dispensaries_ = DISPENSARY_REGIONS.flatMap((group, regionIndex) =>
      group.dispensaries.map((dispensary, index) => ({
        id: regionIndex * 1000 + index,
        name: dispensary.name,
        location: dispensary.location,
        region: group.region,
        websiteUrl: dispensary.url ?? null,
        isPublished: true
      }))
    );

    // Resolve auto-filled statistics the way the API would, so the Story page's
    // stat band shows a real number instead of a blank.
    this.storyStats_ = STORY_STATS.map(stat =>
      stat.autoSource === 'dispensary_count'
        ? { ...stat, value: String(this.dispensaries_.length) }
        : { ...stat }
    );
  }

  /** Maps the API's strain shape onto the model the public components use. */
  private toStrain(api: ApiStrain): Strain {
    const toImage = (image: { src: string; alt: string; label: string | null }): StrainImage => ({
      src: image.src,
      alt: image.alt,
      label: image.label ?? undefined
    });

    return {
      id: api.id,
      slug: api.slug,
      name: api.name,
      shortDescription: api.shortDescription,
      featured: api.featured,
      releaseDate: api.releaseDate ?? undefined,
      mainImage: api.mainImage ? toImage(api.mainImage) : { src: '', alt: api.name },
      galleryImages: api.galleryImages.map(toImage),
      packagingImages: api.packagingImages.map(toImage)
    };
  }

  // -------------------------------------------------------------------------
  // Reads
  // -------------------------------------------------------------------------

  isLive(): boolean {
    return this.live;
  }

  /**
   * Page copy by key. The fallback is the wording the site shipped with, so a
   * key that has not been seeded still renders correctly.
   */
  text(key: string, fallback = ''): string {
    const value = this.text_[key];
    return value === undefined || value === '' ? fallback : value;
  }

  /** Splits a multi-line field into lines, for headings that wrap deliberately. */
  lines(key: string, fallback = ''): string[] {
    return this.text(key, fallback)
      .split('\n')
      .map(line => line.trim())
      .filter(line => line !== '');
  }

  image(key: string, fallbackUrl = '', fallbackAlt = ''): ContentImage {
    const image = this.images_[key];
    if (!image?.url) {
      return { url: fallbackUrl, alt: image?.alt || fallbackAlt };
    }
    return image;
  }

  get strains(): readonly Strain[] {
    return this.strains_;
  }

  get dispensaries(): readonly Dispensary[] {
    return this.dispensaries_;
  }

  /**
   * Dispensaries grouped by region, regions A–Z and shops A–Z within each.
   *
   * Sorted here as well as in SQL so the offline fallback — which reads a file
   * in authoring order — comes out identical to the live API response.
   */
  get dispensaryRegions(): DispensaryRegionGroup[] {
    const groups = new Map<string, DispensaryRegionGroup>();

    for (const dispensary of this.dispensaries_) {
      const existing = groups.get(dispensary.region);
      if (existing) {
        existing.dispensaries.push(dispensary);
      } else {
        groups.set(dispensary.region, { region: dispensary.region, dispensaries: [dispensary] });
      }
    }

    return [...groups.values()]
      .sort((a, b) => a.region.localeCompare(b.region))
      .map(group => ({
        ...group,
        dispensaries: [...group.dispensaries].sort((a, b) => a.name.localeCompare(b.name))
      }));
  }

  get dispensaryCount(): number {
    return this.dispensaries_.length;
  }

  get articles(): readonly Article[] {
    return this.articles_;
  }

  get gallery(): readonly GalleryImage[] {
    return this.gallery_;
  }

  get storySections(): readonly StorySection[] {
    return this.storySections_;
  }

  get storyStats(): readonly StoryStat[] {
    return this.storyStats_;
  }
}
