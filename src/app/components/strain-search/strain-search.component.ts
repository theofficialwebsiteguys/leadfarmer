import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-strain-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './strain-search.component.html',
  styleUrl: './strain-search.component.scss'
})
export class StrainSearchComponent {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();

  clear(): void {
    this.value = '';
    this.valueChange.emit('');
  }
}
