import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Strain, StrainImage } from '../../models/strain.model';
import { StrainsService } from '../../services/strains.service';
import { SITE_CONTACT } from '../../data/site-info.data';
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

  // Set by the format selector further down the page so the gallery can jump to a
  // matching packaging shot; purely a nice-to-have when that image exists.
  @Input() focusLabel?: string;

  // A stable array, recomputed only when `strain` actually changes — not a getter,
  // because ProductGalleryComponent's ngOnChanges resets its index whenever its
  // `images` input gets a new reference, which a getter would do on every CD cycle.
  galleryImages: StrainImage[] = [];

  constructor(private readonly strainsService: StrainsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['strain']) {
      this.galleryImages = this.strainsService.getAllImages(this.strain);
    }
  }

  get wholesaleMailto(): string {
    return `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent('Wholesale Inquiry — ' + this.strain.name)}`;
  }
}
