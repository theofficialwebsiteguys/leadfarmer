import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-catalog-state',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './empty-catalog-state.component.html',
  styleUrl: './empty-catalog-state.component.scss'
})
export class EmptyCatalogStateComponent {
  @Input() heading = 'No Strains Found';
  @Input() message = 'Try adjusting your filters or search.';
  @Input() actionLabel?: string;
  @Input() actionLink?: string;
}
