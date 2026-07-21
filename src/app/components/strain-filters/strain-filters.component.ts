import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FacetOption, SortOption } from '../../services/strains.service';

@Component({
  selector: 'app-strain-filters',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './strain-filters.component.html',
  styleUrl: './strain-filters.component.scss'
})
export class StrainFiltersComponent {
  @Input() classifications: FacetOption[] = [];
  @Input() formats: FacetOption[] = [];
  @Input() badges: FacetOption[] = [];

  @Input() selectedTypes: string[] = [];
  @Input() selectedFormats: string[] = [];
  @Input() selectedBadges: string[] = [];
  @Input() sort: SortOption = 'featured';

  // Owned by the page (combines search + all filters + sort) so this component
  // doesn't need to know about state it doesn't render.
  @Input() hasActiveFilters = false;

  @Output() typesChange = new EventEmitter<string[]>();
  @Output() formatsChange = new EventEmitter<string[]>();
  @Output() badgesChange = new EventEmitter<string[]>();
  @Output() sortChange = new EventEmitter<SortOption>();
  @Output() reset = new EventEmitter<void>();

  mobileOpen = false;

  get selectedCount(): number {
    return this.selectedTypes.length + this.selectedFormats.length + this.selectedBadges.length;
  }

  toggleMobilePanel(): void {
    this.mobileOpen = !this.mobileOpen;
  }

  clearTypes(): void {
    this.typesChange.emit([]);
  }

  toggleType(value: string): void {
    this.typesChange.emit(this.toggleValue(this.selectedTypes, value));
  }

  toggleFormat(value: string): void {
    this.formatsChange.emit(this.toggleValue(this.selectedFormats, value));
  }

  toggleBadge(value: string): void {
    this.badgesChange.emit(this.toggleValue(this.selectedBadges, value));
  }

  private toggleValue(current: string[], value: string): string[] {
    return current.includes(value) ? current.filter(v => v !== value) : [...current, value];
  }
}
