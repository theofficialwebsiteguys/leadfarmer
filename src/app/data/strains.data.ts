import { Strain, StrainFormat } from '../models/strain.model';

// Generic, factual descriptions of what each format physically is — not strain-specific
// marketing claims, so they're safe defaults until/unless a strain needs something custom.
const FORMAT_NOTES: Record<string, string> = {
  'Flower': 'Hand-trimmed indoor flower, sold by weight.',
  'Eighth': '3.5 grams of hand-trimmed flower.',
  'Quarter': '7 grams of hand-trimmed flower.',
  'Half Ounce': '14 grams of hand-trimmed flower.',
  'Dub Sack': 'A 2-gram sample-size bag of flower.',
  'Preroll': 'A single hand-rolled preroll.',
  'Five-Pack': 'Five hand-rolled prerolls in one pack.',
  'Multi-Pack': 'Multiple prerolls bundled in one pack.'
};

function fmt(name: string, description?: string): StrainFormat {
  return { name, description: description ?? FORMAT_NOTES[name] };
}

// Source of truth for the strain catalog. To add a new strain, append another entry here
// with a unique `id`/`slug` and drop its photography under public/assets/product/<name>/.
// Every optional field is safe to omit — components hide sections with no data rather than
// rendering empty labels. See StrainsService for how this feeds the catalog/detail pages.
export const STRAINS: Strain[] = [
  {
    id: 1,
    slug: 'mac1',
    name: 'MAC1',
    classification: 'Hybrid',
    shortDescription:
      "The Capulator's Cut of one of modern cannabis' most coveted hybrids — a naturally-occurring triploid, grown and hand-trimmed in-house.",
    fullDescription:
      "Grown & processed by the LeadFarmer team at their facility in upstate New York, the Capulator's Cut of the MAC1 is one of the most unique & coveted strains in the modern era of cannabis. A cross between Alien Cookies F2 & Miracle 15, this rare plant is a naturally-occurring triploid which is where it derives its compounding potency and creative effects. Hand crafted prerolls & hand trimmed indoor-grown flower give this the perfect burn every time.",
    genetics: 'Alien Cookies F2 × Miracle 15',
    collaboration: 'The Capulator',
    effects: ['Creative'],
    growMethod: 'Hand-trimmed indoor flower',
    indoorOutdoor: 'Indoor',
    cultivationNotes: 'A naturally-occurring triploid — the source of its compounding potency and creative effects.',
    formats: [fmt('Flower'), fmt('Eighth'), fmt('Five-Pack'), fmt('Preroll')],
    badges: ['Collaboration'],
    featured: true,
    releaseDate: '2026-01-12',
    mainImage: { src: 'assets/product/Mac/mac1-flower.jpg', alt: 'MAC1 — hand-trimmed indoor flower', label: 'Flower' },
    galleryImages: [
      { src: 'assets/product/Mac/mac1-flower-2.jpg', alt: 'MAC1 — nug close-up', label: 'Nug Close-Up' },
      { src: 'assets/product/Mac/mac1-five-pack-opened.jpg', alt: 'MAC1 — five-pack of prerolls, opened', label: 'Five-Pack Opened' }
    ],
    packagingImages: [
      { src: 'assets/product/Mac/mac1-eighth.jpg', alt: 'MAC1 — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Mac/mac1-five-pack.jpg', alt: 'MAC1 — packaged five-pack', label: 'Five-Pack' },
      { src: 'assets/product/Mac/mac1-preroll.jpg', alt: 'MAC1 — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['cap-junky', 'tricho-jordan-3', 'white-runtz']
  },
  {
    id: 2,
    slug: 'cap-junky',
    name: 'Cap Junky',
    classification: 'Hybrid',
    shortDescription: 'Miracle Mintz — a mintier, fruitier expression of the legendary MAC1 with heavy knockout power.',
    fullDescription:
      "Commonly referred to as Miracle Mintz, Cap Junky is a collab between Seed Junky & The Capulator. A mintier & fruitier version of the legendary MAC1 with heavy knockout power and a lingering high.",
    genetics: 'MAC1 phenotype',
    collaboration: 'Seed Junky Genetics × The Capulator',
    flavors: ['Mint', 'Fruity'],
    effects: ['Relaxed'],
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower'), fmt('Dub Sack'), fmt('Eighth'), fmt('Quarter'), fmt('Preroll')],
    badges: ['Collaboration'],
    releaseDate: '2025-11-03',
    mainImage: { src: 'assets/product/Cap-Junky/cap-junky-flower.jpg', alt: 'Cap Junky — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Cap-Junky/cap-junky-dub-sack.jpg', alt: 'Cap Junky — dub sack', label: 'Dub Sack' },
      { src: 'assets/product/Cap-Junky/cap-junky-eighth.jpg', alt: 'Cap Junky — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Cap-Junky/cap-junky-quarter.jpg', alt: 'Cap Junky — packaged quarter', label: 'Quarter' },
      { src: 'assets/product/Cap-Junky/cap-junky-preroll.jpg', alt: 'Cap Junky — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['mac1', 'tricho-jordan-3', 'galactic-warheads']
  },
  {
    id: 3,
    slug: 'tricho-jordan-3',
    name: 'Tricho Jordan #3',
    classification: 'Hybrid',
    shortDescription: 'A LeadFarmer pheno hunt pushing trichome production to the next level — creamy butterscotch and port wine.',
    fullDescription:
      "A pheno hunted & selected by the LeadFarmer team, this cultivar brings trichome production to the next level. A creamy butterscotch & port wine taste with gassy undertones make this unique terp profile one of our most sought after releases.",
    breeder: 'LeadFarmer',
    flavors: ['Butterscotch', 'Port Wine', 'Creamy'],
    aromas: ['Gas'],
    indoorOutdoor: 'Indoor',
    cultivationNotes: 'Selected in-house through pheno hunting for its trichome production.',
    formats: [fmt('Flower'), fmt('Dub Sack'), fmt('Eighth'), fmt('Half Ounce'), fmt('Preroll')],
    badges: ['Staff Favorite'],
    releaseDate: '2025-09-20',
    mainImage: { src: 'assets/product/Tricho-Jordan/tricho-jordan-flower.jpg', alt: 'Tricho Jordan #3 — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Tricho-Jordan/tricho-jordan-dub-sack.jpg', alt: 'Tricho Jordan #3 — dub sack', label: 'Dub Sack' },
      { src: 'assets/product/Tricho-Jordan/tricho-jordan-eighth.jpg', alt: 'Tricho Jordan #3 — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Tricho-Jordan/tricho-jordan-half.jpg', alt: 'Tricho Jordan #3 — packaged half ounce', label: 'Half Ounce' },
      { src: 'assets/product/Tricho-Jordan/tricho-jordan-preroll.jpg', alt: 'Tricho Jordan #3 — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['mac1', 'cap-junky', 'zlushies-zoapinator']
  },
  {
    id: 4,
    slug: 'white-runtz',
    name: 'White Runtz',
    classification: 'Hybrid',
    shortDescription: 'A legendary 2017 collab with the Runtz crew — crazy bag appeal, a gassy nose, and total chill-mode effects.',
    fullDescription:
      "A legendary collab with the Runtz crew from 2017, brought into the Compound Genetics stable for breeding due to its crazy bag appeal and gassy nose. Chill mode activated, this cut speaks for itself.",
    breeder: 'Compound Genetics',
    collaboration: 'The Runtz Crew (2017)',
    aromas: ['Gas'],
    effects: ['Relaxed'],
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower'), fmt('Five-Pack'), fmt('Preroll')],
    badges: ['Collaboration'],
    featured: true,
    releaseDate: '2026-02-01',
    mainImage: { src: 'assets/product/White-Runtz/white-runtz-flower.jpg', alt: 'White Runtz — flower', label: 'Flower' },
    galleryImages: [
      { src: 'assets/product/White-Runtz/white-runtz-five-pack-opened.jpg', alt: 'White Runtz — five-pack of prerolls, opened', label: 'Five-Pack Opened' }
    ],
    packagingImages: [
      { src: 'assets/product/White-Runtz/white-runtz-flower-package.jpg', alt: 'White Runtz — packaged flower', label: 'Packaged Flower' },
      { src: 'assets/product/White-Runtz/white-runtz-preroll.jpg', alt: 'White Runtz — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['cap-junky', 'honey-banana', 'galactic-warheads']
  },
  {
    id: 5,
    slug: 'honey-banana',
    name: 'Honey Banana',
    classification: 'Hybrid',
    shortDescription: 'A 15-year crowd favorite bred by Elemental Seed Co. — dense nugs and banana taffy, in limited quantities.',
    fullDescription:
      "A crowd favorite and limited run by the LeadFarmer team, this strain has been around for 15+ years and was bred by the legendary Elemental Seed Company. Normally a hash strain, this cultivar has a super dense nugg structure, was a big yielder and the whiff of banana taffy kept us coming back for more. Available in limited quantities.",
    breeder: 'Elemental Seed Co.',
    flavors: ['Banana', 'Sweet'],
    indoorOutdoor: 'Indoor',
    cultivationNotes: 'A dense-nugged, high-yielding phenotype grown for 15+ years; traditionally used as a hash strain.',
    batchStatus: 'Limited Run — available in limited quantities.',
    formats: [fmt('Flower'), fmt('Eighth'), fmt('Preroll')],
    badges: ['Limited Run'],
    featured: true,
    releaseDate: '2025-12-10',
    mainImage: { src: 'assets/product/Honey-Banana/honey-banana-flower.jpg', alt: 'Honey Banana — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Honey-Banana/honey-banana-eighth.jpg', alt: 'Honey Banana — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Honey-Banana/honey-banana-preroll.jpg', alt: 'Honey Banana — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['white-runtz', 'galactic-warheads', 'z-pie-doink']
  },
  {
    id: 6,
    slug: 'galactic-warheads',
    name: 'Galactic Warheads',
    classification: 'Hybrid',
    shortDescription: 'A Craft Farmer × DankMob collab crossing Amnesia Haze with Colombian Cookies — candy gas, playful high.',
    fullDescription:
      "A collaboration between Craft Farmer & DankMob, this strain is the result of crossing the potent Amnesia Haze with Colombian Cookies. It brings a candy gas flavor along with a social & playful high. Available in flower, pre-rolls and a multi-pack of prerolls.",
    genetics: 'Amnesia Haze × Colombian Cookies',
    collaboration: 'Craft Farmer × DankMob',
    flavors: ['Candy', 'Gas'],
    effects: ['Uplifting', 'Social'],
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower'), fmt('Eighth'), fmt('Preroll'), fmt('Multi-Pack')],
    badges: ['Collaboration'],
    releaseDate: '2025-10-08',
    mainImage: { src: 'assets/product/Galactic-Warheads/galactic-warheads-flower.jpg', alt: 'Galactic Warheads — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Galactic-Warheads/galactic-warheads-eighth.jpg', alt: 'Galactic Warheads — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Galactic-Warheads/galactic-warheads-preroll.jpg', alt: 'Galactic Warheads — preroll', label: 'Preroll' }
    ],
    relatedStrainSlugs: ['white-runtz', 'honey-banana', 'z-pie-doink']
  },
  // TODO: placeholder shortDescription/fullDescription below — swap in real copy
  // (and confirm classification) once available; everything else reflects the
  // photos actually supplied.
  {
    id: 9,
    slug: 'blue-zushi',
    name: 'Blue Zushi',
    classification: 'Hybrid',
    shortDescription: 'Description coming soon — check back for details on this strain.',
    fullDescription: 'Description coming soon — check back for details on this strain.',
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower'), fmt('Eighth')],
    badges: ['New'],
    releaseDate: '2026-07-21',
    mainImage: { src: 'assets/product/Blue-Zushi/blue-zushi-flower.jpg', alt: 'Blue Zushi — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Blue-Zushi/blue-zushi-eighth.jpg', alt: 'Blue Zushi — packaged eighth', label: 'Eighth' }
    ],
    relatedStrainSlugs: ['zoap', 'white-runtz', 'honey-banana']
  },
  {
    id: 10,
    slug: 'zoap',
    name: 'Zoap',
    classification: 'Hybrid',
    shortDescription: 'Description coming soon — check back for details on this strain.',
    fullDescription: 'Description coming soon — check back for details on this strain.',
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower'), fmt('Dub Sack'), fmt('Eighth'), fmt('Quarter'), fmt('Half Ounce')],
    badges: ['New'],
    releaseDate: '2026-07-21',
    mainImage: { src: 'assets/product/Zoap/zoap-flower.jpg', alt: 'Zoap — flower', label: 'Flower' },
    packagingImages: [
      { src: 'assets/product/Zoap/zoap-dub-sack.jpg', alt: 'Zoap — dub sack', label: 'Dub Sack' },
      { src: 'assets/product/Zoap/zoap-eighth.jpg', alt: 'Zoap — packaged eighth', label: 'Eighth' },
      { src: 'assets/product/Zoap/zoap-quarter.jpg', alt: 'Zoap — packaged quarter', label: 'Quarter' },
      { src: 'assets/product/Zoap/zoap-half-ounce.jpg', alt: 'Zoap — packaged half ounce', label: 'Half Ounce' }
    ],
    relatedStrainSlugs: ['zlushies-zoapinator', 'blue-zushi', 'tricho-jordan-3']
  },
  {
    id: 11,
    slug: 'skunk-1-x-northern-lights-5',
    name: 'Skunk #1 × Northern Lights #5',
    classification: 'Hybrid',
    shortDescription: 'Description coming soon — check back for details on this strain.',
    fullDescription: 'Description coming soon — check back for details on this strain.',
    genetics: 'Skunk #1 × Northern Lights #5',
    indoorOutdoor: 'Indoor',
    formats: [fmt('Flower')],
    badges: ['New'],
    releaseDate: '2026-07-21',
    mainImage: { src: 'assets/product/SkunkXNL/skunk-nl5-flower.jpg', alt: 'Skunk #1 × Northern Lights #5 — flower', label: 'Flower' },
    relatedStrainSlugs: ['zoap', 'blue-zushi', 'tricho-jordan-3']
  },
  {
    id: 7,
    slug: 'z-pie-doink',
    name: 'Z-Pie Doink',
    classification: 'Special Preroll',
    shortDescription: 'A first-of-its-kind NY collab — 3.5g of indoor Z Pie, hand-rolled with a 1-of-1000 collectible glass tip.',
    fullDescription:
      "A special collab from the LeadFarmer team — a first of its kind for the legal market in New York. Starring 3.5 grams of our indoor grown Z Pie strain, hand rolled and crowned by Rolling Strains™ with immense precision for the perfect burn. Meant to smoke more like a cigar than a preroll, slowly with a long & even burn. Prepare for candy terps with a strong mouth coat, paired with a 1 of 1000 collectible glass tip.",
    genetics: 'Z Pie',
    collaboration: 'Rolling Strains™',
    flavors: ['Candy'],
    indoorOutdoor: 'Indoor',
    cultivationNotes: 'Meant to be smoked slowly, like a cigar, for a long and even burn.',
    batchStatus: 'Limited to 1,000 numbered releases, each with a collectible glass tip.',
    formats: [fmt('Preroll', '3.5 g hand-rolled special preroll with a 1-of-1000 collectible glass tip.')],
    badges: ['Limited Run', 'Collaboration'],
    featured: true,
    releaseDate: '2026-03-15',
    mainImage: { src: 'assets/product/Z-Pie-Doink/z-pie-doink.jpg', alt: 'Z-Pie Doink — special preroll with collectible glass tip', label: 'Special Preroll' },
    relatedStrainSlugs: ['zlushies-zoapinator', 'tricho-jordan-3', 'galactic-warheads']
  },
  {
    id: 8,
    slug: 'zlushies-zoapinator',
    name: 'Zlushies × Zoapinator',
    classification: 'Infused Preroll',
    shortDescription: "LeadFarmer's own infused preroll blend — Z and Zoap-crossed flower hand-churned with Tricho Jordan #3 kief.",
    fullDescription:
      "Our interpretation of a killer infused preroll. Mixing 2 of our Z & Zoap-crossed strains from our recent harvest, hand churned with kief from our Tricho Jordan #3. The Z wakes you up, and the kief knocks you back down. Put this up against your strongest preroll and you'll see why it was a must-have for our menu.",
    genetics: 'Zlushies × Zoapinator (in-house Z and Zoap crosses)',
    breeder: 'LeadFarmer',
    effects: ['Balanced'],
    indoorOutdoor: 'Indoor',
    cultivationNotes: 'Hand-churned with kief from our Tricho Jordan #3.',
    formats: [fmt('Preroll', 'Hand-rolled infused preroll, kief-churned with our Tricho Jordan #3.')],
    badges: ['Small Batch'],
    releaseDate: '2025-08-22',
    mainImage: { src: 'assets/product/Zlushies-Zoapinator/zlushies-zoapinator-preroll.jpg', alt: 'Zlushies × Zoapinator — infused preroll', label: 'Infused Preroll' },
    relatedStrainSlugs: ['zoap', 'tricho-jordan-3', 'z-pie-doink']
  }
];
