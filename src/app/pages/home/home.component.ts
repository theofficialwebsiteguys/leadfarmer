import { Component, AfterViewInit, ElementRef, Inject, ViewChild, inject } from '@angular/core';
import { DatePipe, DOCUMENT, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StrainsService } from '../../services/strains.service';
import { ContentStore } from '../../services/content-store.service';
import { Strain } from '../../models/strain.model';
import { Article, GalleryImage } from '../../models/content.model';
import { StrainGridComponent } from '../../components/strain-grid/strain-grid.component';
import { ContactFormComponent } from '../../components/contact-form/contact-form.component';

interface Photo {
  src: string;
  alt: string;
  /** Optional white label drawn over the photo; blank for most images. */
  caption: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [DatePipe, UpperCasePipe, RouterLink, StrainGridComponent, ContactFormComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('heroVideo') private readonly heroVideoRef!: ElementRef<HTMLVideoElement>;
  @ViewChild('lightboxEl') private readonly lightboxElRef?: ElementRef<HTMLDivElement>;
  @ViewChild('photosTrack') private readonly photosTrackRef?: ElementRef<HTMLDivElement>;

  private readonly content = inject(ContentStore);

  readonly strains: readonly Strain[];
  readonly photos: Photo[];
  readonly articles: readonly Article[];

  // Editable copy. The second argument to text() is the wording the site
  // shipped with, so the page still reads correctly if the API is unreachable.
  readonly heroWordmark = this.content.image('homepage.heroWordmarkImage', 'assets/brand/brand-lettering-white.png', 'Lead Farmer');
  readonly heroTaglineLines = this.content.lines(
    'homepage.heroTagline',
    'Grown with precision, care, and deep respect for the craft.\nEvery plant tells a story of quality and dedication.'
  );
  readonly heroScrollLabel = this.content.text('homepage.heroScrollLabel', 'Scroll');
  readonly heroPrimaryLabel = this.content.text('homepage.heroPrimaryButtonLabel', 'View Strains');
  readonly heroPrimaryLink = this.content.text('homepage.heroPrimaryButtonLink', '/strains');
  readonly heroSecondaryLabel = this.content.text('homepage.heroSecondaryButtonLabel', 'Shop Merch');
  readonly heroSecondaryLink = this.content.text('homepage.heroSecondaryButtonLink', '/merch');

  readonly storyEyebrow = this.content.text('homepage.storyEyebrow', 'The Craft');
  readonly storyHeadingLines = this.content.lines('homepage.storyHeading', 'Every Plant.\nEvery Room.\nEvery Harvest.');
  readonly storyBody = this.content.text(
    'homepage.storyBody',
    'We cultivate cannabis the way it should be grown — deliberately, and with care. From the moment a clone is set to the final cure, every decision is made with the plant and the customer in mind. Our grow rooms in the Southern Tier are built for precision, consistency, and quality without compromise.'
  );
  readonly storyLocation = this.content.text('homepage.storyLocation', 'Southern Tier, New York');
  readonly storyLinkLabel = this.content.text('homepage.storyLinkLabel', 'Read Our Full Story');
  readonly storyImage = this.content.image('homepage.storyImage', 'assets/brand/brand-full.png');

  readonly strainsEyebrow = this.content.text('homepage.strainsEyebrow', 'Our Strains');
  readonly strainsHeading = this.content.text('homepage.strainsHeading', 'What We Grow');
  readonly strainsButtonLabel = this.content.text('homepage.strainsButtonLabel', 'Browse All Strains');

  readonly galleryEyebrow = this.content.text('homepage.galleryEyebrow', 'Products');
  readonly galleryHeading = this.content.text('homepage.galleryHeading', 'Gallery');

  readonly articlesEyebrow = this.content.text('homepage.articlesEyebrow', 'Field Notes');
  readonly articlesHeading = this.content.text('homepage.articlesHeading', 'Latest Articles');

  readonly contactHeading = this.content.text('homepage.contactHeading', 'Get In Touch');
  readonly contactMark = this.content.image('homepage.contactMarkImage', 'assets/brand/brand-head.png');
  readonly contact = {
    email: this.content.text('homepage.contactEmail', 'info@leadfarmer.com'),
    address: this.content.text('homepage.contactAddress', 'Southern Tier, New York')
  };

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly strainsService: StrainsService
  ) {
    // Only the strains ticked as featured in the admin panel — the full menu
    // lives on /strains. The section hides itself when nothing is featured.
    this.strains = this.strainsService.getFeatured();
    this.articles = this.content.articles;

    // The gallery is curated in the dashboard (Content → Gallery). It was
    // seeded with every strain photo, so this renders the same strip it always
    // did until the client changes it.
    this.photos = this.content.gallery.map((image: GalleryImage) => ({
      src: image.imageUrl ?? image.imageSrc ?? '',
      alt: image.imageAlt ?? '',
      caption: image.caption ?? ''
    }));
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

}
