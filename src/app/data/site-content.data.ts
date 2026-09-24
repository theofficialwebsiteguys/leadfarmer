import { Article, StorySection, StoryStat } from '../models/content.model';

// The repeatable content the site shipped with, in the same shape the API
// returns. Two consumers, one source:
//
//   1. ContentStore renders these if the API cannot be reached, so the site
//      never loses whole sections during an outage (or on a static preview
//      deploy such as GitHub Pages, where there is no backend at all).
//   2. api/database/generate-seed.mjs turns them into seed.sql.
//
// Day-to-day edits happen in the admin panel and live in MySQL — editing this
// file does NOT change the live site.

export const STORY_SECTIONS: StorySection[] = [
  {
    id: 1,
    eyebrow: 'Our Roots',
    heading: 'Southern Tier Grown',
    body: "Lead Farmer started with a simple belief: New York deserves cannabis grown with the same care as the region's best agriculture. Our rooms in the Southern Tier are built for precision — controlled environments, deliberate genetics, and a team that treats every room like the only one that matters.",
    imageSrc: 'assets/product/Mac/mac1-flower.jpg',
    imageAlt: '',
    imageUrl: 'assets/product/Mac/mac1-flower.jpg',
    sortOrder: 0,
    isPublished: true
  },
  {
    id: 2,
    eyebrow: 'Our Process',
    heading: 'Hand-Trimmed, No Shortcuts',
    body: "Nothing about our process is automated for the sake of speed. Every plant is hand-trimmed in-house, every cure is given the time it needs, and every batch is checked against the same standard before it ever leaves the building. If it doesn't meet that bar, it doesn't wear our name.",
    imageSrc: 'assets/product/Cap-Junky/cap-junky-flower.jpg',
    imageAlt: '',
    imageUrl: 'assets/product/Cap-Junky/cap-junky-flower.jpg',
    sortOrder: 1,
    isPublished: true
  }
];

export const STORY_STATS: StoryStat[] = [
  {
    id: 1,
    value: '',
    label: 'Dispensaries Across New York',
    // ContentStore fills this from the dispensary list, the same way the API does.
    autoSource: 'dispensary_count',
    isTextStyle: false,
    sortOrder: 0,
    isPublished: true
  },
  {
    id: 2,
    value: '100%',
    label: 'Hand-Trimmed, In-House',
    autoSource: null,
    isTextStyle: false,
    sortOrder: 1,
    isPublished: true
  },
  {
    id: 3,
    value: 'Southern Tier',
    label: "New York — Where It's Grown",
    autoSource: null,
    isTextStyle: true,
    sortOrder: 2,
    isPublished: true
  }
];

export const ARTICLES: Article[] = [
  {
    id: 1,
    slug: 'the-art-of-curing',
    title: 'The Art of Curing: Why Patience Matters',
    excerpt: 'Great cannabis is not rushed. We break down our curing process and why proper timing makes all the difference in quality and flavor.',
    publishedOn: '2026-05-01',
    imageSrc: null,
    imageAlt: null,
    imageUrl: null,
    externalUrl: null,
    sortOrder: 0,
    isPublished: true
  },
  {
    id: 2,
    slug: 'southern-tier-climate',
    title: 'Southern Tier Growing: Climate Advantages',
    excerpt: 'Our region offers unique environmental conditions that contribute to exceptional flower. Learn what makes our location ideal for cultivation.',
    publishedOn: '2026-04-15',
    imageSrc: null,
    imageAlt: null,
    imageUrl: null,
    externalUrl: null,
    sortOrder: 1,
    isPublished: true
  },
  {
    id: 3,
    slug: 'a-day-in-the-grow-room',
    title: 'Behind the Scenes: A Day in the Grow Room',
    excerpt: 'From environmental controls to daily plant care, get an inside look at the dedication and precision that goes into every harvest.',
    publishedOn: '2026-04-03',
    imageSrc: null,
    imageAlt: null,
    imageUrl: null,
    externalUrl: null,
    sortOrder: 2,
    isPublished: true
  }
];
