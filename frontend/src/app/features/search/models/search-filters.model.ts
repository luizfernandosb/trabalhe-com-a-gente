export type SortBy = 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
export type OrderBy = 'desc' | 'asc';

export interface SearchFilters {
  query: string;
  page: number;
  perPage: number;
  sort: SortBy;
  order: OrderBy;
}
