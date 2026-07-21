import { Component, Input } from '@angular/core';
import { Strain } from '../../models/strain.model';

interface SpecRow {
  label: string;
  value: string;
}

@Component({
  selector: 'app-product-specifications',
  standalone: true,
  imports: [],
  templateUrl: './product-specifications.component.html',
  styleUrl: './product-specifications.component.scss'
})
export class ProductSpecificationsComponent {
  @Input({ required: true }) strain!: Strain;

  get rows(): SpecRow[] {
    const strain = this.strain;
    const rows: SpecRow[] = [];
    const add = (label: string, value: string | undefined): void => {
      if (value) rows.push({ label, value });
    };

    add('Classification', strain.classification);
    add('Genetics', strain.genetics);
    add('Breeder', strain.breeder);
    add('Collaboration', strain.collaboration);
    add('THC', strain.thcRange);
    add('CBD', strain.cbdRange);
    add('Dominant Terpenes', strain.terpenes?.join(', '));
    add('Grow Method', strain.growMethod);
    add('Indoor / Outdoor', strain.indoorOutdoor);
    add('Cultivation Notes', strain.cultivationNotes);
    add('Batch Status', strain.batchStatus);

    return rows;
  }
}
