import { Component, ElementRef, Inject, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { StrainImage } from '../../models/strain.model';

@Component({
  selector: 'app-product-gallery',
  standalone: true,
  imports: [],
  templateUrl: './product-gallery.component.html',
  styleUrl: './product-gallery.component.scss'
})
export class ProductGalleryComponent implements OnChanges, OnDestroy {
  @ViewChild('lightboxEl') private readonly lightboxElRef?: ElementRef<HTMLDivElement>;
  @ViewChild('expandBtn') private readonly expandBtnRef?: ElementRef<HTMLButtonElement>;

  @Input() images: StrainImage[] = [];
  @Input() productName = '';

  // Set by a format selector so picking e.g. "Preroll" can jump the gallery to a
  // matching packaging shot when one exists — purely a nice-to-have, never required.
  @Input() focusLabel?: string;

  currentIndex = 0;
  lightboxOpen = false;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  get isSingle(): boolean {
    return this.images.length <= 1;
  }

  get activeImage(): StrainImage | undefined {
    return this.images[this.currentIndex];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['images']) {
      this.currentIndex = 0;
    }
    if (changes['focusLabel'] && this.focusLabel) {
      const index = this.images.findIndex(img => img.label === this.focusLabel);
      if (index !== -1) this.currentIndex = index;
    }
  }

  ngOnDestroy(): void {
    if (this.lightboxOpen) {
      this.document.body.style.overflow = '';
    }
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }

  next(): void {
    this.currentIndex = (this.currentIndex + 1) % this.images.length;
  }

  prev(): void {
    this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
  }

  openLightbox(): void {
    this.lightboxOpen = true;
    this.document.body.style.overflow = 'hidden';
    setTimeout(() => this.lightboxElRef?.nativeElement.focus());
  }

  closeLightbox(): void {
    this.lightboxOpen = false;
    this.document.body.style.overflow = '';
    this.expandBtnRef?.nativeElement.focus();
  }

  onLightboxKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowRight':
        this.next();
        break;
      case 'ArrowLeft':
        this.prev();
        break;
    }
  }
}
