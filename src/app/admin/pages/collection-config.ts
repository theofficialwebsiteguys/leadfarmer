import { CollectionResource } from '../services/admin-api.service';

/** How one editable field is rendered and validated in the collection editor. */
export interface CollectionField {
  key: string;
  label: string;
  help?: string;
  type: 'text' | 'textarea' | 'url' | 'date' | 'image' | 'checkbox' | 'select';
  required?: boolean;
  placeholder?: string;
  /** For type 'select'. */
  options?: { value: string; label: string }[];
  /** Paired alt-text field key, for type 'image'. */
  altKey?: string;
}

export interface CollectionConfig {
  resource: CollectionResource;
  /** Plural, as a heading. */
  title: string;
  /** Singular, used in buttons and confirmations. */
  singular: string;
  description: string;
  /** Field shown as the row title in the list. */
  titleField: string;
  /** Used as the row title when `titleField` is empty (optional fields). */
  titleFallbackField?: string;
  /** Extra fields shown as small meta text in the list. */
  metaFields: string[];
  /** Field whose value is the row thumbnail, when the list has images. */
  imageField?: string;
  fields: CollectionField[];
  /** Blank record used when adding. */
  blank: Record<string, unknown>;
  reorderable: boolean;
}

/**
 * Declarative definitions for the simple repeatable lists. The list and editor
 * screens are generic and read everything from here, so adding another list
 * later means adding one entry (plus the matching API resource).
 */
export const COLLECTION_CONFIGS: Record<CollectionResource, CollectionConfig> = {
  dispensaries: {
    resource: 'dispensaries',
    title: 'Dispensaries',
    singular: 'dispensary',
    description:
      'The shops that carry Lead Farmer, listed on the Story page. They group themselves by region and sort alphabetically, and the count in the statistics band updates automatically.',
    titleField: 'name',
    metaFields: ['location', 'region'],
    // Alphabetical by region, then by name — nothing to arrange by hand.
    reorderable: false,
    fields: [
      { key: 'name', label: 'Dispensary name', type: 'text', required: true },
      { key: 'location', label: 'Town or city', type: 'text', required: true, placeholder: 'Nyack' },
      {
        key: 'region',
        label: 'Region heading',
        type: 'text',
        required: true,
        help: 'Shops with exactly the same wording here appear under one heading, e.g. “Hudson Valley”. Regions are listed A–Z on the page.',
        placeholder: 'Hudson Valley'
      },
      { key: 'websiteUrl', label: 'Website (optional)', type: 'url', help: 'If set, the name becomes a link. Leave blank for plain text.' },
      { key: 'isPublished', label: 'Show on the website', type: 'checkbox' }
    ],
    blank: { name: '', location: '', region: '', websiteUrl: '', isPublished: true }
  },

  articles: {
    resource: 'articles',
    title: 'Articles',
    singular: 'article',
    description: 'The “Field Notes” cards on the home page.',
    titleField: 'title',
    metaFields: ['publishedOn'],
    imageField: 'imageUrl',
    reorderable: true,
    fields: [
      { key: 'title', label: 'Headline', type: 'text', required: true },
      {
        key: 'slug',
        label: 'Web address',
        type: 'text',
        required: true,
        help: 'Lowercase letters, numbers and hyphens only, e.g. the-art-of-curing.'
      },
      { key: 'excerpt', label: 'Short summary', type: 'textarea', help: 'The paragraph shown on the card.' },
      { key: 'publishedOn', label: 'Date', type: 'date' },
      { key: 'imageSrc', label: 'Picture', type: 'image', altKey: 'imageAlt' },
      {
        key: 'externalUrl',
        label: 'Link to (optional)',
        type: 'url',
        help: 'Where “Read More” goes. Leave blank to use this article’s own page.'
      },
      { key: 'isPublished', label: 'Show on the website', type: 'checkbox' }
    ],
    blank: { title: '', slug: '', excerpt: '', publishedOn: '', imageSrc: '', imageAlt: '', externalUrl: '', isPublished: true }
  },

  gallery: {
    resource: 'gallery',
    title: 'Gallery',
    singular: 'photo',
    description:
      'The photo strip on the home page. Drag order with the arrows — that is the order visitors scroll through.',
    // Most photos have no caption, so fall back to the image description.
    titleField: 'caption',
    titleFallbackField: 'imageAlt',
    metaFields: [],
    imageField: 'imageUrl',
    reorderable: true,
    fields: [
      { key: 'imageSrc', label: 'Photo', type: 'image', required: true, altKey: 'imageAlt' },
      {
        key: 'caption',
        label: 'Label on the photo (optional)',
        type: 'text',
        help: 'Shown as small white text in the corner of the photo. Most photos leave this blank — it is usually the strain name on the first photo of each set.'
      },
      { key: 'isPublished', label: 'Show on the website', type: 'checkbox' }
    ],
    blank: { imageSrc: '', imageAlt: '', caption: '', isPublished: true }
  },

  'story-sections': {
    resource: 'story-sections',
    title: 'Story sections',
    singular: 'section',
    description:
      'The alternating picture-and-text rows on the Story page. They automatically alternate left and right in the order below.',
    titleField: 'heading',
    metaFields: ['eyebrow'],
    imageField: 'imageUrl',
    reorderable: true,
    fields: [
      { key: 'eyebrow', label: 'Small label above the heading', type: 'text', placeholder: 'Our Roots' },
      { key: 'heading', label: 'Heading', type: 'text', required: true, placeholder: 'Southern Tier Grown' },
      { key: 'body', label: 'Paragraph', type: 'textarea', required: true },
      { key: 'imageSrc', label: 'Picture', type: 'image', altKey: 'imageAlt' },
      { key: 'isPublished', label: 'Show on the website', type: 'checkbox' }
    ],
    blank: { eyebrow: '', heading: '', body: '', imageSrc: '', imageAlt: '', isPublished: true }
  },

  'story-stats': {
    resource: 'story-stats',
    title: 'Story statistics',
    singular: 'statistic',
    description: 'The three big numbers on the black band of the Story page.',
    titleField: 'label',
    metaFields: ['value'],
    reorderable: true,
    fields: [
      {
        key: 'value',
        label: 'Big text',
        type: 'text',
        help: 'The large line, e.g. “100%”. Leave blank if you choose an automatic value below.',
        placeholder: '100%'
      },
      { key: 'label', label: 'Caption underneath', type: 'text', required: true, placeholder: 'Hand-Trimmed, In-House' },
      {
        key: 'autoSource',
        label: 'Fill in automatically',
        type: 'select',
        help: 'Choose “Number of dispensaries” and the big text keeps itself up to date as you add or remove shops.',
        options: [
          { value: '', label: 'No — I will type it myself' },
          { value: 'dispensary_count', label: 'Number of dispensaries' }
        ]
      },
      {
        key: 'isTextStyle',
        label: 'This is a word, not a number',
        type: 'checkbox',
        help: 'Renders it slightly smaller, like “Southern Tier”.'
      },
      { key: 'isPublished', label: 'Show on the website', type: 'checkbox' }
    ],
    blank: { value: '', label: '', autoSource: '', isTextStyle: false, isPublished: true }
  }
};
