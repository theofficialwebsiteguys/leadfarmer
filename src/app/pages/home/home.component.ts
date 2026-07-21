import { Component, AfterViewInit, ElementRef, Inject, ViewChild } from '@angular/core';
import { DatePipe, DOCUMENT, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StrainsService } from '../../services/strains.service';
import { Strain } from '../../models/strain.model';
import { SITE_CONTACT } from '../../data/site-info.data';
import { StrainGridComponent } from '../../components/strain-grid/strain-grid.component';

interface Photo {
  src: string;
  alt: string;
  strain: string;
  isGroupStart: boolean; // first photo of this strain in the flattened list — used for the light label/divider
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
  imports: [DatePipe, UpperCasePipe, RouterLink, StrainGridComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('heroVideo') private readonly heroVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('lightboxEl') private readonly lightboxElRef?: ElementRef<HTMLDivElement>;
  @ViewChild('photosTrack') private readonly photosTrackRef?: ElementRef<HTMLDivElement>;

  readonly contact = SITE_CONTACT;
  readonly strains: readonly Strain[];
  readonly photos: Photo[];

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly strainsService: StrainsService
  ) {
    this.strains = this.strainsService.getAll();

    // Every strain photo in one flat list, for the Photos carousel + lightbox
    this.photos = this.strains.flatMap(strain =>
      this.strainsService.getAllImages(strain).map((image, i) => ({
        src: image.src,
        alt: image.alt,
        strain: strain.name,
        isGroupStart: i === 0
      }))
    );
  }

  ngAfterViewInit(): void {
    const video = this.heroVideoRef?.nativeElement;
    if (video) {
      video.muted = true;
      video.play().catch(() => {});
    }
  }

  scrollPhotos(direction: 1 | -1): void {
    const track = this.photosTrackRef?.nativeElement;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.8, behavior: 'smooth' });
  }

  activePhotoIndex: number | null = null;

  openPhoto(index: number): void {
    this.activePhotoIndex = index;
    this.document.body.style.overflow = 'hidden';
    setTimeout(() => this.lightboxElRef?.nativeElement.focus());
  }

  closePhoto(): void {
    this.activePhotoIndex = null;
    this.document.body.style.overflow = '';
  }

  nextPhoto(): void {
    if (this.activePhotoIndex === null) return;
    this.activePhotoIndex = (this.activePhotoIndex + 1) % this.photos.length;
  }

  prevPhoto(): void {
    if (this.activePhotoIndex === null) return;
    this.activePhotoIndex = (this.activePhotoIndex - 1 + this.photos.length) % this.photos.length;
  }

  onLightboxKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape': this.closePhoto(); break;
      case 'ArrowRight': this.nextPhoto(); break;
      case 'ArrowLeft': this.prevPhoto(); break;
    }
  }

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
