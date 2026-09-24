import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { Strain, StrainImage } from '../../models/strain.model';
import { StrainsService } from '../../services/strains.service';
import { ContentStore } from '../../services/content-store.service';
import { ProductGalleryComponent } from '../product-gallery/product-gallery.component';

@Component({
  selector: 'app-product-hero',
  standalone: true,
  imports: [ProductGalleryComponent],
  templateUrl: './product-hero.component.html',
  styleUrl: './product-hero.component.scss'
})
export class ProductHeroComponent implements OnChanges {
  @Input({ required: true }) strain!: Strain;

  // A stable array, recomputed only when `strain` actually changes — not a getter,
  // because ProductGalleryComponent's ngOnChanges resets its index whenever its
  // `images` input gets a new reference, which a getter would do on every CD cycle.
  galleryImages: StrainImage[] = [];

  private readonly content = inject(ContentStore);

  readonly wholesaleLabel = this.content.text('strains.detailWholesaleButtonLabel', 'Wholesale Inquiry');

  constructor(private readonly strainsService: StrainsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['strain']) {
      this.galleryImages = this.strainsService.getAllImages(this.strain);
    }
  }

  get wholesaleMailto(): string {
    const email = this.content.text('homepage.contactEmail', 'info@leadfarmer.com');
    return `mailto:${email}?subject=${encodeURIComponent('Wholesale Inquiry — ' + this.strain.name)}`;
  }
}
