import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';

interface ProductImage {
  label: string;
  src: string;
}

interface Product {
  id: number;
  name: string;
  type: string;
  description: string;
  images: ProductImage[];   // first image is shown as hero; others reserved for future gallery
  availableForms: string[];
}

// Replace with API/CMS data when available
interface Article {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  slug: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, UpperCasePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('heroVideo') private heroVideoRef!: ElementRef<HTMLVideoElement>;
  readonly currentYear = new Date().getFullYear();

  ngAfterViewInit(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  private readonly selectedImages = new Map<number, number>();

  getSelectedIndex(productId: number): number {
    return this.selectedImages.get(productId) ?? 0;
  }

  selectImage(productId: number, index: number): void {
    this.selectedImages.set(productId, index);
  }

  // TODO: Replace with real contact details
  readonly contactEmail = 'info@leadfarmer.com';
  readonly contactAddress = 'Southern Tier, New York';

  readonly products: Product[] = [
    {
      id: 1,
      name: 'MAC1',
      type: 'Hybrid',
      description: 'Grown & processed by the LeadFarmer team at their facility in upstate New York, the Capulator\'s Cut of the MAC1 is one of the most unique & coveted strains in the modern era of cannabis. A cross between Alien Cookies F2 & Miracle 15, this rare plant is a naturally-occurring triploid which is where it derives its compounding potency and creative effects. Hand crafted prerolls & hand trimmed indoor-grown flower give this the perfect burn every time.',
      images: [
        { label: 'Flower',          src: 'assets/product/Mac/mac1-flower.jpg' },
        { label: 'Nug Close-Up',    src: 'assets/product/Mac/mac1-flower-2.jpg' },
        { label: 'Eighth',          src: 'assets/product/Mac/mac1-eighth.jpg' },
        { label: 'Five-Pack',       src: 'assets/product/Mac/mac1-five-pack.jpg' },
        { label: 'Five-Pack Open',  src: 'assets/product/Mac/mac1-five-pack-opened.jpg' },
        { label: 'Preroll',         src: 'assets/product/Mac/mac1-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Eighth', 'Five-Pack', 'Preroll']
    },
    {
      id: 2,
      name: 'Cap Junky',
      type: 'Hybrid',
      description: 'Commonly referred to as Miracle Mintz, Cap Junky is a collab between Seed Junky & The Capulator. A mintier & fruitier version of the legendary MAC1 with heavy knockout power and a lingering high.',
      images: [
        { label: 'Flower',    src: 'assets/product/Cap-Junky/cap-junky-flower.jpg' },
        { label: 'Dub Sack',  src: 'assets/product/Cap-Junky/cap-junky-dub-sack.jpg' },
        { label: 'Eighth',    src: 'assets/product/Cap-Junky/cap-junky-eighth.jpg' },
        { label: 'Quarter',   src: 'assets/product/Cap-Junky/cap-junky-quarter.jpg' },
        { label: 'Preroll',   src: 'assets/product/Cap-Junky/cap-junky-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Dub Sack', 'Eighth', 'Quarter', 'Preroll']
    },
    {
      id: 3,
      name: 'Tricho Jordan #3',
      type: 'Hybrid',
      description: 'A pheno hunted & selected by the LeadFarmer team, this cultivar brings trichome production to the next level. A creamy butterscotch & port wine taste with gassy undertones make this unique terp profile one of our most sought after releases.',
      images: [
        { label: 'Flower',      src: 'assets/product/Tricho-Jordan/tricho-jordan-flower.jpg' },
        { label: 'Dub Sack',    src: 'assets/product/Tricho-Jordan/tricho-jordan-dub-sack.jpg' },
        { label: 'Eighth',      src: 'assets/product/Tricho-Jordan/tricho-jordan-eighth.jpg' },
        { label: 'Half Ounce',  src: 'assets/product/Tricho-Jordan/tricho-jordan-half.jpg' },
        { label: 'Preroll',     src: 'assets/product/Tricho-Jordan/tricho-jordan-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Dub Sack', 'Eighth', 'Half Ounce', 'Preroll']
    },
    {
      id: 4,
      name: 'White Runtz',
      type: 'Hybrid',
      description: 'A legendary collab with the Runtz crew from 2017, brought into the Compound Genetics stable for breeding due to its crazy bag appeal and gassy nose. Chill mode activated, this cut speaks for itself.',
      images: [
        { label: 'Flower',       src: 'assets/product/White-Runtz/white-runtz-flower.jpg' },
        { label: 'Packaged',     src: 'assets/product/White-Runtz/white-runtz-flower-package.jpg' },
        { label: 'Five-Pack',    src: 'assets/product/White-Runtz/white-runtz-five-pack-opened.jpg' },
        { label: 'Preroll',      src: 'assets/product/White-Runtz/white-runtz-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Five-Pack', 'Preroll']
    },
    {
      id: 5,
      name: 'Honey Banana',
      type: 'Hybrid',
      description: 'A crowd favorite and limited run by the LeadFarmer team, this strain has been around for 15+ years and was bred by the legendary Elemental Seed Company. Normally a hash strain, this cultivar has a super dense nugg structure, was a big yielder and the whiff of banana taffy kept us coming back for more. Available in limited quantities.',
      images: [
        { label: 'Flower',   src: 'assets/product/Honey-Banana/honey-banana-flower.jpg' },
        { label: 'Eighth',   src: 'assets/product/Honey-Banana/honey-banana-eighth.jpg' },
        { label: 'Preroll',  src: 'assets/product/Honey-Banana/honey-banana-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Eighth', 'Preroll', 'Limited Run']
    },
    {
      id: 6,
      name: 'Galactic Warheads',
      type: 'Hybrid',
      description: 'A collaboration between Craft Farmer & DankMob, this strain is the result of crossing the potent Amnesia Haze with Colombian Cookies. It brings a candy gas flavor along with a social & playful high. Available in flower, pre-rolls and a multi-pack of prerolls.',
      images: [
        { label: 'Flower',   src: 'assets/product/Galactic-Warheads/galactic-warheads-flower.jpg' },
        { label: 'Eighth',   src: 'assets/product/Galactic-Warheads/galactic-warheads-eighth.jpg' },
        { label: 'Preroll',  src: 'assets/product/Galactic-Warheads/galactic-warheads-preroll.jpg' }
      ],
      availableForms: ['Flower', 'Eighth', 'Preroll', 'Multi-Pack']
    },
    {
      id: 7,
      name: 'Z-Pie Doink',
      type: 'Special Preroll',
      description: 'A special collab from the LeadFarmer team — a first of its kind for the legal market in New York. Starring 3.5 grams of our indoor grown Z Pie strain, hand rolled and crowned by Rolling Strains™ with immense precision for the perfect burn. Meant to smoke more like a cigar than a preroll, slowly with a long & even burn. Prepare for candy terps with a strong mouth coat, paired with a 1 of 1000 collectible glass tip.',
      images: [
        { label: 'Special Preroll', src: 'assets/product/Z-Pie-Doink/z-pie-doink.jpg' }
      ],
      availableForms: ['3.5g Special Preroll', 'Collectible Glass Tip']
    },
    {
      id: 8,
      name: 'Zlushies × Zoapinator',
      type: 'Infused Preroll',
      description: 'Our interpretation of a killer infused preroll. Mixing 2 of our Z & Zoap-crossed strains from our recent harvest, hand churned with kief from our Tricho Jordan #3. The Z wakes you up, and the kief knocks you back down. Put this up against your strongest preroll and you\'ll see why it was a must-have for our menu.',
      images: [
        { label: 'Infused Preroll', src: 'assets/product/Zlushies-Zoapinator/zlushies-zoapinator-preroll.jpg' }
      ],
      availableForms: ['Infused Preroll', 'Kief-Rolled']
    }
  ];

  // TODO: Replace with real article data from CMS/API
  readonly articles: Article[] = [
    {
      id: 1,
      title: 'The Art of Curing: Why Patience Matters',
      excerpt: 'Great cannabis is not rushed. We break down our curing process and why proper timing makes all the difference in quality and flavor.',
      date: '2026-05-01',
      slug: 'the-art-of-curing'
    },
    {
      id: 2,
      title: 'Southern Tier Growing: Climate Advantages',
      excerpt: 'Our region offers unique environmental conditions that contribute to exceptional flower. Learn what makes our location ideal for cultivation.',
      date: '2026-04-15',
      slug: 'southern-tier-climate'
    },
    {
      id: 3,
      title: 'Behind the Scenes: A Day in the Grow Room',
      excerpt: 'From environmental controls to daily plant care, get an inside look at the dedication and precision that goes into every harvest.',
      date: '2026-04-03',
      slug: 'a-day-in-the-grow-room'
    }
  ];
}
