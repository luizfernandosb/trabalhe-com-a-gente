import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, map, startWith } from 'rxjs';

import { SearchStateService } from '../../../features/search/services/search-state.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  protected readonly state = inject(SearchStateService);
  private readonly router = inject(Router);

  constructor() {
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => this.router.url.includes('/issues')),
      takeUntilDestroyed(),
    ).subscribe((isOnIssues) => {
      if (isOnIssues) {
        this.state.sortControl.disable({ emitEvent: false });
        this.state.orderControl.disable({ emitEvent: false });
      } else {
        this.state.sortControl.enable({ emitEvent: false });
        this.state.orderControl.enable({ emitEvent: false });
      }
    });
  }
}
