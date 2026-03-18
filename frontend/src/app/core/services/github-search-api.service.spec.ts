import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { GithubSearchApiService } from './github-search-api.service';
import { SearchRepositoriesResponse, SearchIssuesResponse } from '../models/repository.model';

const mockRepository = {
  id: '1',
  full_name: 'facebook/react',
  description: 'A JS library',
  html_url: 'https://github.com/facebook/react',
  language: 'JavaScript',
  stargazers_count: 230000,
  watchers_count: 230000,
  topics: ['ui', 'frontend'],
  updated_at: '2024-06-01T00:00:00Z',
  owner: { login: 'facebook', avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4' },
};

const mockIssue = {
  id: '101',
  number: 28456,
  title: 'Fix memory leak',
  state: 'open',
  html_url: 'https://github.com/facebook/react/issues/28456',
  created_at: '2024-03-10T10:00:00Z',
  updated_at: '2024-03-12T08:00:00Z',
  closed_at: null,
  body: 'Description',
  comments: 14,
  user: { login: 'dev-user', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
  labels: [{ id: 'l1', name: 'bug', color: 'd73a4a' }],
};

describe('GithubSearchApiService', () => {
  let service: GithubSearchApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), GithubSearchApiService],
    });
    service = TestBed.inject(GithubSearchApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  describe('searchRepositories()', () => {
    const filters = { query: 'react', page: 1, perPage: 10, sort: 'stars' as const, order: 'desc' as const };

    it('deve fazer POST para /graphql', () => {
      const mockResponse: SearchRepositoriesResponse = {
        repositories: [mockRepository],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      };

      service.searchRepositories(filters).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.method).toBe('POST');
      req.flush({ data: { searchRepositories: mockResponse } });
    });

    it('deve enviar os parâmetros corretos no body', () => {
      service.searchRepositories(filters).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.body.variables).toEqual(filters);
      expect(req.request.body.query).toContain('searchRepositories');
      req.flush({ data: { searchRepositories: { repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 } } });
    });

    it('deve retornar a lista de repositórios mapeada', () => {
      const mockResponse: SearchRepositoriesResponse = {
        repositories: [mockRepository],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      };

      let result: SearchRepositoriesResponse | undefined;
      service.searchRepositories(filters).subscribe((r) => (result = r));

      http.expectOne('/graphql').flush({ data: { searchRepositories: mockResponse } });
      expect(result?.repositories).toHaveLength(1);
      expect(result?.repositories[0].full_name).toBe('facebook/react');
    });

    it('deve retornar resposta vazia quando data é nulo', () => {
      let result: SearchRepositoriesResponse | undefined;
      service.searchRepositories(filters).subscribe((r) => (result = r));

      http.expectOne('/graphql').flush({ data: null });
      expect(result?.repositories).toEqual([]);
      expect(result?.totalCount).toBe(0);
    });

    it('deve incluir o campo query na requisição GraphQL', () => {
      service.searchRepositories({ ...filters, query: 'angular' }).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.body.variables.query).toBe('angular');
      req.flush({ data: { searchRepositories: { repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 } } });
    });
  });

  describe('searchIssues()', () => {
    it('deve fazer POST para /graphql', () => {
      service.searchIssues('facebook/react', 1, 10).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.method).toBe('POST');
      req.flush({ data: { searchIssues: { issues: [], totalCount: 0, currentPage: 1, totalPages: 1 } } });
    });

    it('deve enviar fullName, page e perPage no body', () => {
      service.searchIssues('angular/angular', 2, 10).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.body.variables).toEqual({ fullName: 'angular/angular', page: 2, perPage: 10 });
      req.flush({ data: { searchIssues: { issues: [], totalCount: 0, currentPage: 1, totalPages: 1 } } });
    });

    it('deve retornar a lista de issues mapeada', () => {
      const mockResponse: SearchIssuesResponse = {
        issues: [mockIssue],
        totalCount: 1,
        currentPage: 1,
        totalPages: 1,
      };

      let result: SearchIssuesResponse | undefined;
      service.searchIssues('facebook/react', 1, 10).subscribe((r) => (result = r));

      http.expectOne('/graphql').flush({ data: { searchIssues: mockResponse } });
      expect(result?.issues).toHaveLength(1);
      expect(result?.issues[0].title).toBe('Fix memory leak');
    });

    it('deve retornar resposta vazia quando data é nulo', () => {
      let result: SearchIssuesResponse | undefined;
      service.searchIssues('facebook/react', 1, 10).subscribe((r) => (result = r));

      http.expectOne('/graphql').flush({ data: null });
      expect(result?.issues).toEqual([]);
      expect(result?.totalCount).toBe(0);
    });

    it('deve incluir a query searchIssues no body', () => {
      service.searchIssues('facebook/react', 1, 10).subscribe();

      const req = http.expectOne('/graphql');
      expect(req.request.body.query).toContain('searchIssues');
      req.flush({ data: { searchIssues: { issues: [], totalCount: 0, currentPage: 1, totalPages: 1 } } });
    });
  });
});
