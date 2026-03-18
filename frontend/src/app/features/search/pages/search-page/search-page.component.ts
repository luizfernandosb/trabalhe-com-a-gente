import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';

import { SearchStateService } from '../../services/search-state.service';
import { RepositoryCardComponent } from '../../components/repository-card/repository-card.component';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    RepositoryCardComponent,
  ],
  templateUrl: './search-page.component.html',
  styleUrl: './search-page.component.scss',
})
export class SearchPageComponent {
  protected readonly state = inject(SearchStateService);
}
