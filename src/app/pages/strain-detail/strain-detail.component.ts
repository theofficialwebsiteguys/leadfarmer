import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Strain } from '../../models/strain.model';
import { StrainsService } from '../../services/strains.service';
import { SeoService } from '../../services/seo.service';
import { ProductHeroComponent } from '../../components/product-hero/product-hero.component';
import { RelatedStrainsComponent } from '../../components/related-strains/related-strains.component';
import { EmptyCatalogStateComponent } from '../../components/empty-catalog-state/empty-catalog-state.component';

@Component({
  selector: 'app-strain-detail',
  standalone: true,
  imports: [
    RouterLink,
    ProductHeroComponent,
    RelatedStrainsComponent,
    EmptyCatalogStateComponent
  ],
  templateUrl: './strain-detail.component.html',
  styleUrl: './strain-detail.component.scss'
})
export class StrainDetailComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  strain: Strain | null = null;
  relatedStrains: Strain[] = [];

  constructor(
    private readonly strainsService: StrainsService,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe(params => {
      this.loadStrain(params.get('slug') ?? '');
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private loadStrain(slug: string): void {
    const strain = this.strainsService.getBySlug(slug);
    this.strain = strain ?? null;

    if (!strain) {
      this.relatedStrains = [];
      this.seoService.set({
        title: 'Strain Not Found — Lead Farmer',
        description: 'This strain could not be found. Browse the full Lead Farmer strain menu.'
      });
      this.seoService.setNoIndex();
      return;
    }

    this.relatedStrains = this.strainsService.getOtherProducts(strain);

    this.seoService.set({
      title: `${strain.name} — Lead Farmer`,
      description: strain.shortDescription,
      image: strain.mainImage.src
    });
  }
}
