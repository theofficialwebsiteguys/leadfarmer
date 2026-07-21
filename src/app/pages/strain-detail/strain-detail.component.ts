import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { Strain } from '../../models/strain.model';
import { StrainsService } from '../../services/strains.service';
import { SeoService } from '../../services/seo.service';
import { ProductHeroComponent } from '../../components/product-hero/product-hero.component';
import { ProductSpecificationsComponent } from '../../components/product-specifications/product-specifications.component';
import { FlavorProfileComponent } from '../../components/flavor-profile/flavor-profile.component';
import { ProductFormatSelectorComponent } from '../../components/product-format-selector/product-format-selector.component';
import { RetailerAvailabilityComponent } from '../../components/retailer-availability/retailer-availability.component';
import { RelatedStrainsComponent } from '../../components/related-strains/related-strains.component';
import { EmptyCatalogStateComponent } from '../../components/empty-catalog-state/empty-catalog-state.component';

@Component({
  selector: 'app-strain-detail',
  standalone: true,
  imports: [
    RouterLink,
    ProductHeroComponent,
    ProductSpecificationsComponent,
    FlavorProfileComponent,
    ProductFormatSelectorComponent,
    RetailerAvailabilityComponent,
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
  selectedFormat: string | null = null;

  constructor(
    private readonly strainsService: StrainsService,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.subscription = this.route.paramMap.subscribe(params => {
      this.loadStrain(params.get('slug') ?? '');
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get focusImageLabel(): string | undefined {
    const strain = this.strain;
    const selectedFormat = this.selectedFormat;
    if (!strain || !selectedFormat) return undefined;

    const match = this.strainsService
      .getAllImages(strain)
      .find(img => img.label?.toLowerCase().includes(selectedFormat.toLowerCase()));
    return match?.label;
  }

  selectFormat(name: string): void {
    this.selectedFormat = name;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { format: name },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private loadStrain(slug: string): void {
    const strain = this.strainsService.getBySlug(slug);
    this.strain = strain ?? null;

    if (!strain) {
      this.relatedStrains = [];
      this.selectedFormat = null;
      this.seoService.set({
        title: 'Strain Not Found — Lead Farmer',
        description: 'This strain could not be found. Browse the full Lead Farmer strain menu.'
      });
      this.seoService.setNoIndex();
      return;
    }

    this.relatedStrains = this.strainsService.getRelated(strain);
    this.selectedFormat = this.route.snapshot.queryParamMap.get('format') ?? strain.formats[0]?.name ?? null;

    this.seoService.set({
      title: `${strain.name} — Lead Farmer`,
      description: strain.shortDescription,
      image: strain.mainImage.src
    });
  }
}
