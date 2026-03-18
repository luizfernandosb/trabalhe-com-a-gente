import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';

import { SearchIssuesResponse, SearchRepositoriesResponse } from '../models/repository.model';
import { SearchFilters } from '../../features/search/models/search-filters.model';

interface GraphqlResponse<T> {
  data?: T;
}

const EMPTY_REPOSITORIES_RESPONSE: SearchRepositoriesResponse = {
  repositories: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
};

const EMPTY_ISSUES_RESPONSE: SearchIssuesResponse = {
  issues: [],
  totalCount: 0,
  currentPage: 1,
  totalPages: 1,
};

@Injectable({ providedIn: 'root' })
export class GithubSearchApiService {
  private readonly http = inject(HttpClient);

  searchRepositories(filters: SearchFilters): Observable<SearchRepositoriesResponse> {
    const query = `
      query SearchRepositories($query: String!, $page: Int!, $perPage: Int!, $sort: String!, $order: String!) {
        searchRepositories(query: $query, page: $page, perPage: $perPage, sort: $sort, order: $order) {
          totalCount
          currentPage
          totalPages
          repositories {
            id
            full_name
            description
            html_url
            language
            stargazers_count
            watchers_count
            topics
            updated_at
            owner {
              login
              avatar_url
            }
          }
        }
      }
    `;

    return this.http
      .post<GraphqlResponse<{ searchRepositories: SearchRepositoriesResponse }>>('/graphql', {
        query,
        variables: filters,
      })
      .pipe(
        map((response) => response.data?.searchRepositories ?? EMPTY_REPOSITORIES_RESPONSE),
      );
  }

  // fullName = campo full_name do repositório (ex: "facebook/react")
  searchIssues(fullName: string, page: number, perPage: number): Observable<SearchIssuesResponse> {
    const query = `
      query SearchIssues($fullName: String!, $page: Int!, $perPage: Int!) {
        searchIssues(fullName: $fullName, page: $page, perPage: $perPage) {
          totalCount
          currentPage
          totalPages
          issues {
            id
            number
            title
            state
            html_url
            created_at
            updated_at
            closed_at
            body
            comments
            user {
              login
              avatar_url
            }
            labels {
              id
              name
              color
            }
          }
        }
      }
    `;

    return this.http
      .post<GraphqlResponse<{ searchIssues: SearchIssuesResponse }>>('/graphql', {
        query,
        variables: { fullName, page, perPage },
      })
      .pipe(
        map((response) => response.data?.searchIssues ?? EMPTY_ISSUES_RESPONSE),
      );
  }
}
