import { Strain } from '../models/strain.model';

// The catalog as it shipped before the admin panel existed. Two jobs remain:
//   1. the offline fallback ContentStore renders if the API cannot be reached, and
//   2. the source api/database/generate-seed.mjs reads to build seed.sql.
//
// Day-to-day strain edits happen in the admin panel and live in MySQL — changing
// this file does NOT change the live site.
export const STRAINS: Strain[] = [
  {
    id: 1,
    slug: "mac1",
    name: "MAC1",
    shortDescription:
      "The Capulator's Cut of one of modern cannabis' most coveted hybrids — a naturally-occurring triploid, grown and hand-trimmed in-house.",
    featured: true,
    releaseDate: "2026-01-12",
    mainImage: { src: "assets/product/Mac/mac1-flower.jpg", alt: "MAC1 — hand-trimmed indoor flower", label: "Flower" },
    galleryImages: [
      { src: "assets/product/Mac/mac1-flower-2.jpg", alt: "MAC1 — nug close-up", label: "Nug Close-Up" },
      { src: "assets/product/Mac/mac1-five-pack-opened.jpg", alt: "MAC1 — five-pack of prerolls, opened", label: "Five-Pack Opened" }
    ],
    packagingImages: [
      { src: "assets/product/Mac/mac1-eighth.jpg", alt: "MAC1 — packaged eighth", label: "Eighth" },
      { src: "assets/product/Mac/mac1-five-pack.jpg", alt: "MAC1 — packaged five-pack", label: "Five-Pack" },
      { src: "assets/product/Mac/mac1-preroll.jpg", alt: "MAC1 — preroll", label: "Preroll" }
    ]
  },
  {
    id: 2,
    slug: "cap-junky",
    name: "Cap Junky",
    shortDescription:
      "Miracle Mintz — a mintier, fruitier expression of the legendary MAC1 with heavy knockout power.",
    releaseDate: "2025-11-03",
    mainImage: { src: "assets/product/Cap-Junky/cap-junky-flower.jpg", alt: "Cap Junky — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Cap-Junky/cap-junky-dub-sack.jpg", alt: "Cap Junky — dub sack", label: "Dub Sack" },
      { src: "assets/product/Cap-Junky/cap-junky-eighth.jpg", alt: "Cap Junky — packaged eighth", label: "Eighth" },
      { src: "assets/product/Cap-Junky/cap-junky-quarter.jpg", alt: "Cap Junky — packaged quarter", label: "Quarter" },
      { src: "assets/product/Cap-Junky/cap-junky-preroll.jpg", alt: "Cap Junky — preroll", label: "Preroll" }
    ]
  },
  {
    id: 3,
    slug: "tricho-jordan-3",
    name: "Tricho Jordan #3",
    shortDescription:
      "A LeadFarmer pheno hunt pushing trichome production to the next level — creamy butterscotch and port wine.",
    releaseDate: "2025-09-20",
    mainImage: { src: "assets/product/Tricho-Jordan/tricho-jordan-flower.jpg", alt: "Tricho Jordan #3 — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Tricho-Jordan/tricho-jordan-dub-sack.jpg", alt: "Tricho Jordan #3 — dub sack", label: "Dub Sack" },
      { src: "assets/product/Tricho-Jordan/tricho-jordan-eighth.jpg", alt: "Tricho Jordan #3 — packaged eighth", label: "Eighth" },
      { src: "assets/product/Tricho-Jordan/tricho-jordan-half.jpg", alt: "Tricho Jordan #3 — packaged half ounce", label: "Half Ounce" },
      { src: "assets/product/Tricho-Jordan/tricho-jordan-preroll.jpg", alt: "Tricho Jordan #3 — preroll", label: "Preroll" }
    ]
  },
  {
    id: 4,
    slug: "white-runtz",
    name: "White Runtz",
    shortDescription:
      "A legendary 2017 collab with the Runtz crew — crazy bag appeal, a gassy nose, and total chill-mode effects.",
    featured: true,
    releaseDate: "2026-02-01",
    mainImage: { src: "assets/product/White-Runtz/white-runtz-flower.jpg", alt: "White Runtz — flower", label: "Flower" },
    galleryImages: [
      { src: "assets/product/White-Runtz/white-runtz-five-pack-opened.jpg", alt: "White Runtz — five-pack of prerolls, opened", label: "Five-Pack Opened" }
    ],
    packagingImages: [
      { src: "assets/product/White-Runtz/white-runtz-flower-package.jpg", alt: "White Runtz — packaged flower", label: "Packaged Flower" },
      { src: "assets/product/White-Runtz/white-runtz-preroll.jpg", alt: "White Runtz — preroll", label: "Preroll" }
    ]
  },
  {
    id: 5,
    slug: "honey-banana",
    name: "Honey Banana",
    shortDescription:
      "A 15-year crowd favorite bred by Elemental Seed Co. — dense nugs and banana taffy, in limited quantities.",
    featured: true,
    releaseDate: "2025-12-10",
    mainImage: { src: "assets/product/Honey-Banana/honey-banana-flower.jpg", alt: "Honey Banana — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Honey-Banana/honey-banana-eighth.jpg", alt: "Honey Banana — packaged eighth", label: "Eighth" },
      { src: "assets/product/Honey-Banana/honey-banana-preroll.jpg", alt: "Honey Banana — preroll", label: "Preroll" }
    ]
  },
  {
    id: 6,
    slug: "galactic-warheads",
    name: "Galactic Warheads",
    shortDescription:
      "A Craft Farmer × DankMob collab crossing Amnesia Haze with Colombian Cookies — candy gas, playful high.",
    releaseDate: "2025-10-08",
    mainImage: { src: "assets/product/Galactic-Warheads/galactic-warheads-flower.jpg", alt: "Galactic Warheads — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Galactic-Warheads/galactic-warheads-eighth.jpg", alt: "Galactic Warheads — packaged eighth", label: "Eighth" },
      { src: "assets/product/Galactic-Warheads/galactic-warheads-preroll.jpg", alt: "Galactic Warheads — preroll", label: "Preroll" }
    ]
  },
  {
    id: 9,
    slug: "blue-zushi",
    name: "Blue Zushi",
    shortDescription:
      "Description coming soon — check back for details on this strain.",
    releaseDate: "2026-07-21",
    mainImage: { src: "assets/product/Blue-Zushi/blue-zushi-flower.jpg", alt: "Blue Zushi — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Blue-Zushi/blue-zushi-eighth.jpg", alt: "Blue Zushi — packaged eighth", label: "Eighth" }
    ]
  },
  {
    id: 10,
    slug: "zoap",
    name: "Zoap",
    shortDescription:
      "Description coming soon — check back for details on this strain.",
    releaseDate: "2026-07-21",
    mainImage: { src: "assets/product/Zoap/zoap-flower.jpg", alt: "Zoap — flower", label: "Flower" },
    packagingImages: [
      { src: "assets/product/Zoap/zoap-dub-sack.jpg", alt: "Zoap — dub sack", label: "Dub Sack" },
      { src: "assets/product/Zoap/zoap-eighth.jpg", alt: "Zoap — packaged eighth", label: "Eighth" },
      { src: "assets/product/Zoap/zoap-quarter.jpg", alt: "Zoap — packaged quarter", label: "Quarter" },
      { src: "assets/product/Zoap/zoap-half-ounce.jpg", alt: "Zoap — packaged half ounce", label: "Half Ounce" }
    ]
  },
  {
    id: 11,
    slug: "skunk-1-x-northern-lights-5",
    name: "Skunk #1 × Northern Lights #5",
    shortDescription:
      "Description coming soon — check back for details on this strain.",
    releaseDate: "2026-07-21",
    mainImage: { src: "assets/product/SkunkXNL/skunk-nl5-flower.jpg", alt: "Skunk #1 × Northern Lights #5 — flower", label: "Flower" }
  },
  {
    id: 7,
    slug: "z-pie-doink",
    name: "Z-Pie Doink",
    shortDescription:
      "A first-of-its-kind NY collab — 3.5g of indoor Z Pie, hand-rolled with a 1-of-1000 collectible glass tip.",
    featured: true,
    releaseDate: "2026-03-15",
    mainImage: { src: "assets/product/Z-Pie-Doink/z-pie-doink.jpg", alt: "Z-Pie Doink — special preroll with collectible glass tip", label: "Special Preroll" }
  },
  {
    id: 8,
    slug: "zlushies-zoapinator",
    name: "Zlushies × Zoapinator",
    shortDescription:
      "LeadFarmer's own infused preroll blend — Z and Zoap-crossed flower hand-churned with Tricho Jordan #3 kief.",
    releaseDate: "2025-08-22",
    mainImage: { src: "assets/product/Zlushies-Zoapinator/zlushies-zoapinator-preroll.jpg", alt: "Zlushies × Zoapinator — infused preroll", label: "Infused Preroll" }
  }
];
