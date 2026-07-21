import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SeoData {
  title: string;
  description: string;
  image?: string;
}

// Client-rendered app, so these tags land after JS runs rather than in the initial
// HTML — the same ceiling the rest of the site's SEO already operates under. This
// extends the existing per-route `title` mechanism to pages whose title depends on data.
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(
    private readonly titleService: Title,
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  set(data: SeoData): void {
    this.titleService.setTitle(data.title);
    this.meta.updateTag({ name: 'description', content: data.description });
    this.meta.removeTag('name="robots"');

    const canonicalUrl = this.document.location.origin + this.document.location.pathname;
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:title', content: data.title });
    this.meta.updateTag({ property: 'og:description', content: data.description });
    this.meta.updateTag({ property: 'og:url', content: canonicalUrl });

    if (data.image) {
      this.meta.updateTag({ property: 'og:image', content: new URL(data.image, this.document.baseURI).href });
    }

    this.setCanonicalLink(canonicalUrl);
  }

  // For URLs that resolved to no real content (e.g. an unknown strain slug) so search
  // engines don't index the empty-state page under that URL.
  setNoIndex(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex' });
  }

  private setCanonicalLink(url: string): void {
    let link = this.document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
