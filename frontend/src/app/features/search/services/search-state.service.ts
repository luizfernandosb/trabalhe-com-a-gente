import { Injectable, inject } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, finalize, map, merge, Observable, of, shareReplay, startWith, switchMap } from 'rxjs';

import { Repository, SearchRepositoriesResponse } from '../../../core/models/repository.model';
import { GithubSearchApiService } from '../../../core/services/github-search-api.service';
import { OrderBy, SortBy } from '../models/search-filters.model';
import { SearchHistoryService } from './search-history.service';

@Injectable({ providedIn: 'root' })
export class SearchStateService {
  private readonly api = inject(GithubSearchApiService);
  private readonly historyService = inject(SearchHistoryService);

  constructor() {
    merge(this.sortControl.valueChanges, this.orderControl.valueChanges)
      .subscribe(() => this.page$.next(1));
  }

  readonly queryControl = new FormControl('', { nonNullable: true });
  readonly sortControl = new FormControl<SortBy>('stars', { nonNullable: true });
  readonly orderControl = new FormControl<OrderBy>('desc', { nonNullable: true });

  private readonly query$ = new BehaviorSubject<string>('');
  private readonly page$ = new BehaviorSubject<number>(1);

  readonly history = this.historyService.getHistory();

  readonly hasSearched$ = this.query$.pipe(map((q) => q.trim().length > 0));

  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  readonly isLoading$ = this._loading$.asObservable();

  readonly isSearchDisabled$ = this.queryControl.valueChanges.pipe(
    startWith(this.queryControl.value),
    map((v) => !v.trim()),
  );

  readonly vm$: Observable<SearchRepositoriesResponse> = combineLatest([
    this.query$,
    this.page$,
    this.sortControl.valueChanges.pipe(startWith(this.sortControl.value)),
    this.orderControl.valueChanges.pipe(startWith(this.orderControl.value)),
  ]).pipe(
    switchMap(([query, page, sort, order]) => {
      if (!query) {
        return of({
          repositories: [],
          totalCount: 0,
          currentPage: 1,
          totalPages: 1,
        });
      }

      this._loading$.next(true);
      return this.api.searchRepositories({
        query,
        page,
        perPage: 10,
        sort,
        order,
      }).pipe(finalize(() => this._loading$.next(false)));
    }),
    shareReplay(1),
  );

  readonly repositories$: Observable<Repository[]> = this.vm$.pipe(
    map((value) => value.repositories),
  );

  search(): void {
    const trimmed = this.queryControl.value.trim();
    if (!trimmed) return;

    this.page$.next(1);
    this.query$.next(trimmed);
    this.historyService.save(trimmed);
  }

  onEnter(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.search();
    }
  }

  useHistory(item: string): void {
    this.queryControl.setValue(item);
    this.search();
  }

  pageChange(event: PageEvent): void {
    this.page$.next(event.pageIndex + 1);
  }
}
