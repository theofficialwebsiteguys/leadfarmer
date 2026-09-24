import { Component, Input } from '@angular/core';
import { Strain } from '../../models/strain.model';
import { StrainGridComponent } from '../strain-grid/strain-grid.component';

/**
 * The "check out other products" strip at the bottom of a strain page. The
 * strains are picked at random by StrainsService — there is nothing to curate.
 */
@Component({
  selector: 'app-related-strains',
  standalone: true,
  imports: [StrainGridComponent],
  templateUrl: './related-strains.component.html',
  styleUrl: './related-strains.component.scss'
})
export class RelatedStrainsComponent {
  @Input() strains: Strain[] = [];
}
