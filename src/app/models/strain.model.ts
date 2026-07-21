// Centralized product/strain data shape. Swap `strains.data.ts` for an API/CMS-backed
// source later without changing any component — every field here is read-only display
// data except the future-ecommerce block at the bottom, which is unused today.

export type StrainBadge =
  | 'New'
  | 'Limited Run'
  | 'Collaboration'
  | 'Staff Favorite'
  | 'Small Batch'
  | 'Seasonal';

export interface StrainImage {
  src: string;
  alt: string;
  label?: string;
}

export interface StrainFormat {
  name: string;
  description?: string;
}

export interface Retailer {
  name: string;
  city: string;
  region?: string;
  url?: string;
}

export interface Strain {
  id: number;
  slug: string;
  name: string;
  classification: string;
  shortDescription: string;
  fullDescription: string;

  genetics?: string;
  breeder?: string;
  collaboration?: string;

  thcRange?: string;
  cbdRange?: string;
  terpenes?: string[];
  flavors?: string[];
  aromas?: string[];
  effects?: string[];

  growMethod?: string;
  indoorOutdoor?: string;
  cultivationNotes?: string;
  batchStatus?: string;

  formats: StrainFormat[];
  badges?: StrainBadge[];
  featured?: boolean;
  releaseDate?: string;

  mainImage: StrainImage;
  galleryImages?: StrainImage[];
  packagingImages?: StrainImage[];

  retailers?: Retailer[];
  relatedStrainSlugs?: string[];

  // Future ecommerce readiness — intentionally unused today. A future developer can
  // wire these to real inventory/pricing without touching the catalog/detail components.
  price?: number;
  sku?: string;
  inventory?: number;
  purchasable?: boolean;
  cartEnabled?: boolean;
}
