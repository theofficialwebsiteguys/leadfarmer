import { Component, Input } from '@angular/core';
import { Retailer } from '../../models/strain.model';
import { SITE_CONTACT } from '../../data/site-info.data';

@Component({
  selector: 'app-retailer-availability',
  standalone: true,
  imports: [],
  templateUrl: './retailer-availability.component.html',
  styleUrl: './retailer-availability.component.scss'
})
export class RetailerAvailabilityComponent {
  @Input() retailers?: Retailer[];
  @Input({ required: true }) strainName!: string;

  get mailtoHref(): string {
    return `mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent('Availability — ' + this.strainName)}`;
  }
}
