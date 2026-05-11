import { Component, Input } from '@angular/core';

export interface ProductImage {
  label: string;
  src: string;
}

@Component({
  selector: 'app-product-carousel',
  standalone: true,
  imports: [],
  templateUrl: './product-carousel.component.html',
  styleUrl: './product-carousel.component.scss'
})
export class ProductCarouselComponent {
  @Input() images: ProductImage[] = [];
  @Input() productName = '';

  currentIndex = 0;

  get isSingle(): boolean {
    return this.images.length <= 1;
  }

  goTo(index: number): void {
    this.currentIndex = index;
  }
}
