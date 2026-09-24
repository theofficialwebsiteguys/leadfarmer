// Shapes returned by the PHP API. These mirror the JSON the backend produces —
// see api/app/*Repo.php for the server-side counterparts.

/** One editable field on a page, as returned to the admin dashboard. */
export interface ContentBlock {
  id: number;
  key: string;
  value: string;
  altText: string;
  imageUrl: string | null;
  fieldType: 'text' | 'textarea' | 'url' | 'image';
  section: string;
  groupLabel: string;
  fieldLabel: string;
  helpText: string;
  sortOrder: number;
  updatedAt: string;
}

/** An image field resolved to a ready-to-use absolute URL by the API. */
export interface ContentImage {
  url: string | null;
  alt: string;
}

export interface Dispensary {
  id: number;
  name: string;
  location: string;
  region: string;
  websiteUrl: string | null;
  isPublished: boolean;
}

export interface DispensaryRegionGroup {
  region: string;
  dispensaries: Dispensary[];
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  publishedOn: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  imageUrl: string | null;
  externalUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
}

/** One photo in the home page gallery carousel. */
export interface GalleryImage {
  id: number;
  imageSrc: string | null;
  imageAlt: string | null;
  imageUrl: string | null;
  /** Optional white label drawn over the photo. */
  caption: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface StorySection {
  id: number;
  eyebrow: string | null;
  heading: string;
  body: string | null;
  imageSrc: string | null;
  imageAlt: string | null;
  imageUrl: string | null;
  sortOrder: number;
  isPublished: boolean;
}

export interface StoryStat {
  id: number;
  value: string;
  label: string;
  /** When set, the API fills `value` from live data instead of stored text. */
  autoSource: string | null;
  isTextStyle: boolean;
  sortOrder: number;
  isPublished: boolean;
}

export interface MediaItem {
  id: number;
  filename: string;
  /** Stored, site-relative path — this is what gets saved into content fields. */
  path: string;
  /** Absolute URL for display. */
  url: string | null;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  width: number;
  height: number;
  altText: string;
  createdAt: string;
}

/** Everything the public site needs, fetched in one request at start-up. */
export interface SiteContent {
  content: Record<string, string>;
  images: Record<string, ContentImage>;
  strains: ApiStrain[];
  dispensaries: Dispensary[];
  articles: Article[];
  gallery: GalleryImage[];
  storySections: StorySection[];
  storyStats: StoryStat[];
}

export interface ApiStrainImage {
  id?: number;
  /** Absolute URL, ready for an <img src>. */
  src: string;
  /** Site-relative path as stored — what the admin form edits. */
  path?: string;
  alt: string;
  label: string | null;
}

/** The API's strain shape. Mapped to the public `Strain` model by ContentStore. */
export interface ApiStrain {
  id: number;
  slug: string;
  name: string;
  shortDescription: string;
  featured: boolean;
  isPublished: boolean;
  releaseDate: string | null;
  sortOrder: number;
  mainImage: ApiStrainImage | null;
  galleryImages: ApiStrainImage[];
  packagingImages: ApiStrainImage[];
}

/** Envelope every API endpoint responds with. */
export interface ApiEnvelope<T> {
  ok: boolean;
  data: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  /** Field name → message, for highlighting inputs in a form. */
  fields?: Record<string, string>;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string | null;
}

export interface SessionState {
  authenticated: boolean;
  user: AdminUser | null;
  csrfToken: string;
}
