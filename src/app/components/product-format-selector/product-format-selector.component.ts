import { Component, EventEmitter, Input, Output } from '@angular/core';
import { StrainFormat } from '../../models/strain.model';

@Component({
  selector: 'app-product-format-selector',
  standalone: true,
  imports: [],
  templateUrl: './product-format-selector.component.html',
  styleUrl: './product-format-selector.component.scss'
})
export class ProductFormatSelectorComponent {
  @Input() formats: StrainFormat[] = [];
  @Input() selected: string | null = null;
  @Output() selectedChange = new EventEmitter<string>();

  get selectedDescription(): string | undefined {
    return this.formats.find(format => format.name === this.selected)?.description;
  }

  select(name: string): void {
    this.selectedChange.emit(name);
  }
}
