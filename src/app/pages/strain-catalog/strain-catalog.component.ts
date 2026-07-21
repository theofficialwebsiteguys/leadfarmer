import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CatalogFacets, SortOption, StrainsService } from '../../services/strains.service';
import { SeoService } from '../../services/seo.service';
import { Strain } from '../../models/strain.model';
import { StrainGridComponent } from '../../components/strain-grid/strain-grid.component';
import { StrainFiltersComponent } from '../../components/strain-filters/strain-filters.component';
import { StrainSearchComponent } from '../../components/strain-search/strain-search.component';

function splitParam(value: string | null): string[] {
  return value ? value.split(',').filter(Boolean) : [];
}

@Component({
  selector: 'app-strain-catalog',
  standalone: true,
  imports: [StrainGridComponent, StrainFiltersComponent, StrainSearchComponent],
  templateUrl: './strain-catalog.component.html',
  styleUrl: './strain-catalog.component.scss'
})
export class StrainCatalogComponent implements OnInit, OnDestroy {
  private subscription?: Subscription;

  readonly facets: CatalogFacets;
  readonly totalCount: number;

  types: string[] = [];
  formats: string[] = [];
  badges: string[] = [];
  search = '';
  sort: SortOption = 'featured';

  results: readonly Strain[] = [];

  constructor(
    private readonly strainsService: StrainsService,
    private readonly seoService: SeoService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    this.facets = this.strainsService.getFacets();
    this.totalCount = this.strainsService.getAll().length;
  }

  ngOnInit(): void {
    this.seoService.set({
      title: 'Strains — Lead Farmer',
      description: 'Browse every Lead Farmer strain currently in rotation — filter by type or format, or search by name.'
    });

    this.subscription = this.route.queryParamMap.subscribe(params => {
      this.types = splitParam(params.get('type'));
      this.formats = splitParam(params.get('format'));
      this.badges = splitParam(params.get('badge'));
      this.search = params.get('q') ?? '';
      this.sort = (params.get('sort') as SortOption | null) ?? 'featured';
      this.applyQuery();
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasActiveFilters(): boolean {
    return (
      this.types.length > 0 ||
      this.formats.length > 0 ||
      this.badges.length > 0 ||
      !!this.search ||
      this.sort !== 'featured'
    );
  }

  onSearchChange(value: string): void {
    this.updateQueryParams({ q: value || null });
  }

  onTypesChange(values: string[]): void {
    this.updateQueryParams({ type: values.length ? values.join(',') : null });
  }

  onFormatsChange(values: string[]): void {
    this.updateQueryParams({ format: values.length ? values.join(',') : null });
  }

  onBadgesChange(values: string[]): void {
    this.updateQueryParams({ badge: values.length ? values.join(',') : null });
  }

  onSortChange(value: SortOption): void {
    this.updateQueryParams({ sort: value === 'featured' ? null : value });
  }

  resetFilters(): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
  }

  private applyQuery(): void {
    this.results = this.strainsService.query({
      types: this.types,
      formats: this.formats,
      badges: this.badges,
      search: this.search,
      sort: this.sort
    });
  }

  private updateQueryParams(patch: Record<string, string | null>): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: patch,
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
