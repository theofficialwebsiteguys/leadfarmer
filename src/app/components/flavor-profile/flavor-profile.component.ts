import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-flavor-profile',
  standalone: true,
  imports: [],
  templateUrl: './flavor-profile.component.html',
  styleUrl: './flavor-profile.component.scss'
})
export class FlavorProfileComponent {
  @Input() flavors?: string[];
  @Input() aromas?: string[];
  @Input() effects?: string[];

  get hasContent(): boolean {
    return !!(this.flavors?.length || this.aromas?.length || this.effects?.length);
  }
}
