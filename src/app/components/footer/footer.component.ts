import { Component, inject } from '@angular/core';
import { ContentStore } from '../../services/content-store.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  private readonly content = inject(ContentStore);

  readonly currentYear = new Date().getFullYear();

  // NY OCM requires this notice; it is editable so compliance wording can be
  // updated without a rebuild, but it should not be changed casually.
  readonly warningText = this.content.text(
    'footer.warningText',
    'For use only by adults 21 years of age and older. Keep out of reach of children and pets. In case of accidental ingestion or overconsumption, contact the Poison Center at 1-800-222-1222 or call 9-1-1. Please consume responsibly. Cannabis can be addictive. Concerned? Contact the NY State HOPELine — text "HopeNY," call 1-877-8-HOPENY, or visit'
  );
  readonly warningLinkLabel = this.content.text('footer.warningLinkLabel', 'oasas.ny.gov/HOPELine');
  readonly warningLinkUrl = this.content.text('footer.warningLinkUrl', 'https://oasas.ny.gov/HOPELine');
  readonly copyrightSuffix = this.content.text('footer.copyrightSuffix', 'Lead Farmer. Premium Cannabis Cultivation.');
}
