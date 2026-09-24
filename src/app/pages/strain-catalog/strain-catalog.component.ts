import { Component, OnInit, inject } from '@angular/core';
import { StrainsService } from '../../services/strains.service';
import { SeoService } from '../../services/seo.service';
import { ContentStore } from '../../services/content-store.service';
import { Strain } from '../../models/strain.model';
import { StrainGridComponent } from '../../components/strain-grid/strain-grid.component';

@Component({
  selector: 'app-strain-catalog',
  standalone: true,
  imports: [StrainGridComponent],
  templateUrl: './strain-catalog.component.html',
  styleUrl: './strain-catalog.component.scss'
})
export class StrainCatalogComponent implements OnInit {
  private readonly strainsService = inject(StrainsService);
  private readonly seoService = inject(SeoService);
  private readonly content = inject(ContentStore);

  // Featured strains first, then the order set in the admin panel.
  readonly strains: readonly Strain[] = this.strainsService.getAll();

  readonly pageEyebrow = this.content.text('strains.pageEyebrow', 'The Full Menu');
  readonly pageHeading = this.content.text('strains.pageHeading', 'Strains');
  readonly pageIntro = this.content.text(
    'strains.pageIntro',
    'Browse every strain currently in rotation.'
  );

  ngOnInit(): void {
    this.seoService.set({
      title: this.content.text('seo.strainsTitle', 'Strains — Lead Farmer'),
      description: this.content.text(
        'seo.strainsDescription',
        'Browse every Lead Farmer strain currently in rotation.'
      )
    });
  }
}
