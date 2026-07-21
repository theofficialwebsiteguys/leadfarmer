import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Strain } from '../../models/strain.model';
import { RevealOnScrollDirective } from '../../directives/reveal-on-scroll.directive';

@Component({
  selector: 'app-strain-card',
  standalone: true,
  imports: [RouterLink, RevealOnScrollDirective],
  templateUrl: './strain-card.component.html',
  styleUrl: './strain-card.component.scss'
})
export class StrainCardComponent {
  @Input({ required: true }) strain!: Strain;

  // Set to 2 when the card sits directly under the page's H1 with no intervening
  // section heading (e.g. the catalog grid); defaults to 3 for section-nested grids.
  @Input() headingLevel: 2 | 3 = 3;

  // 'minimal' is the image-forward, single-label homepage teaser card; 'detailed'
  // (default) is the fuller shop card used on the catalog page and Related Strains.
  @Input() variant: 'detailed' | 'minimal' = 'detailed';

  // Off on the catalog grid, where filtering re-renders cards and a re-triggered
  // reveal would read as a glitch rather than an entrance.
  @Input() revealOnScroll = true;
}
