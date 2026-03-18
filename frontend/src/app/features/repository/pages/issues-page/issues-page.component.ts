import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, finalize, Observable, of, switchMap } from 'rxjs';

import { SearchIssuesResponse } from '../../../../core/models/repository.model';
import { GithubSearchApiService } from '../../../../core/services/github-search-api.service';
import { IssueCardComponent } from '../../components/issue-card/issue-card.component';

@Component({
  selector: 'app-issues-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatPaginatorModule,
    IssueCardComponent,
  ],
  templateUrl: './issues-page.component.html',
  styleUrl: './issues-page.component.scss',
})
export class IssuesPageComponent {
  private readonly api = inject(GithubSearchApiService);
  private readonly route = inject(ActivatedRoute);

  protected readonly owner = this.route.snapshot.paramMap.get('owner') ?? '';
  protected readonly repo = this.route.snapshot.paramMap.get('repo') ?? '';
  protected readonly fullName = this.owner && this.repo ? `${this.owner}/${this.repo}` : '';

  private readonly page$ = new BehaviorSubject<number>(1);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  protected readonly isLoading$ = this._loading$.asObservable();

  protected readonly vm$: Observable<SearchIssuesResponse> = this.page$.pipe(
    switchMap((page) => {
      if (!this.fullName) {
        return of({ issues: [], totalCount: 0, currentPage: 1, totalPages: 1 });
      }

      this._loading$.next(true);
      return this.api.searchIssues(this.fullName, page, 10).pipe(
        finalize(() => this._loading$.next(false)),
      );
    }),
  );

  protected pageChange(event: PageEvent): void {
    this.page$.next(event.pageIndex + 1);
  }
}
