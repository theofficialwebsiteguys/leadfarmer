// The strain shape the public components render. Data comes from the API (see
// ContentStore); `strains.data.ts` remains only as the offline fallback and the
// seed source.
//
// Scope note: this deliberately holds only what the site actually shows — the
// name, the short description and the photos. Growing details, tasting notes,
// formats and badges were removed once those sections came off the strain page,
// so the admin panel cannot collect information that never appears anywhere.

export interface StrainImage {
  src: string;
  alt: string;
  /** Short caption shown under the photo in the gallery, e.g. "Eighth". */
  label?: string;
}

export interface Strain {
  id: number;
  slug: string;
  name: string;
  /** The blurb on the strain card and at the top of the strain page. */
  shortDescription: string;

  /** Sorts to the front of the catalog. */
  featured?: boolean;
  /** Drives the "newest first" ordering. */
  releaseDate?: string;

  mainImage: StrainImage;
  galleryImages?: StrainImage[];
  packagingImages?: StrainImage[];
}
