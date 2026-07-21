import { Component, Input } from '@angular/core';
import { Strain } from '../../models/strain.model';
import { StrainCardComponent } from '../strain-card/strain-card.component';
import { StrainCardSkeletonComponent } from '../strain-card-skeleton/strain-card-skeleton.component';
import { EmptyCatalogStateComponent } from '../empty-catalog-state/empty-catalog-state.component';

@Component({
  selector: 'app-strain-grid',
  standalone: true,
  imports: [StrainCardComponent, StrainCardSkeletonComponent, EmptyCatalogStateComponent],
  templateUrl: './strain-grid.component.html',
  styleUrl: './strain-grid.component.scss'
})
export class StrainGridComponent {
  @Input() strains: readonly Strain[] = [];
  @Input() isLoading = false;
  @Input() skeletonCount = 6;

  @Input() cardHeadingLevel: 2 | 3 = 3;
  @Input() cardVariant: 'detailed' | 'minimal' = 'detailed';
  @Input() cardRevealOnScroll = true;

  @Input() emptyHeading = 'No Strains Found';
  @Input() emptyMessage = 'Try adjusting your filters or search.';
  @Input() emptyActionLabel?: string;
  @Input() emptyActionLink?: string;

  get skeletonPlaceholders(): number[] {
    return Array.from({ length: this.skeletonCount }, (_, i) => i);
  }
}
