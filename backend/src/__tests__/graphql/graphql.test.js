import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { env } from '../../config/env.js';

// Mock do serviço para isolar os testes do GraphQL da camada HTTP
vi.mock('../../services/github.service.js', () => ({
  searchRepositories: vi.fn(),
  searchIssues: vi.fn(),
}));

import { searchRepositories, searchIssues } from '../../services/github.service.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const gql = (query, variables = {}) =>
  request(app)
    .post('/graphql')
    .set('Content-Type', 'application/json')
    .set('Authorization', `Bearer ${env.API_TOKEN}`)
    .send({ query, variables });

const SEARCH_REPOS_QUERY = `
  query($query: String!, $page: Int!, $perPage: Int!, $sort: String!, $order: String!) {
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

const SEARCH_ISSUES_QUERY = `
  query($fullName: String!, $page: Int!, $perPage: Int!) {
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

// ─── Dados mock ───────────────────────────────────────────────────────────────
const mockRepository = {
  id: '1',
  full_name: 'facebook/react',
  description: 'The library for web and native user interfaces.',
  html_url: 'https://github.com/facebook/react',
  language: 'JavaScript',
  stargazers_count: 230000,
  watchers_count: 230000,
  topics: ['declarative', 'frontend'],
  updated_at: '2024-06-01T00:00:00Z',
  owner: {
    login: 'facebook',
    avatar_url: 'https://avatars.githubusercontent.com/u/69631?v=4',
  },
};

const mockIssue = {
  id: '101',
  number: 28456,
  title: 'Fix memory leak in useEffect cleanup',
  state: 'open',
  html_url: 'https://github.com/facebook/react/issues/28456',
  created_at: '2024-03-10T10:00:00Z',
  updated_at: '2024-03-12T08:00:00Z',
  closed_at: null,
  body: 'Description here',
  comments: 14,
  user: { login: 'dev-user', avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4' },
  labels: [
    { id: 'l1', name: 'bug', color: 'd73a4a' },
    { id: 'l2', name: 'good first issue', color: '7057ff' },
  ],
};

const reposPayload = {
  repositories: [mockRepository],
  totalCount: 1,
  currentPage: 1,
  totalPages: 1,
};

const issuesPayload = {
  issues: [mockIssue],
  totalCount: 1,
  currentPage: 1,
  totalPages: 1,
};

beforeEach(() => vi.clearAllMocks());

// ─── searchRepositories via GraphQL ──────────────────────────────────────────
describe('GraphQL: searchRepositories', () => {
  it('deve retornar 200 com a lista de repositórios', async () => {
    searchRepositories.mockResolvedValue(reposPayload);
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.status).toBe(200);
    expect(res.body.data.searchRepositories.repositories).toHaveLength(1);
    expect(res.body.data.searchRepositories.repositories[0].full_name).toBe('facebook/react');
  });

  it('deve retornar totalCount correto', async () => {
    searchRepositories.mockResolvedValue({ ...reposPayload, totalCount: 125 });
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.body.data.searchRepositories.totalCount).toBe(125);
  });

  it('deve retornar currentPage e totalPages corretos', async () => {
    searchRepositories.mockResolvedValue({ ...reposPayload, currentPage: 2, totalPages: 13 });
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 2, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.body.data.searchRepositories.currentPage).toBe(2);
    expect(res.body.data.searchRepositories.totalPages).toBe(13);
  });

  it('deve retornar os campos do owner corretamente', async () => {
    searchRepositories.mockResolvedValue(reposPayload);
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    const owner = res.body.data.searchRepositories.repositories[0].owner;
    expect(owner.login).toBe('facebook');
    expect(owner.avatar_url).toContain('avatars.githubusercontent.com');
  });

  it('deve retornar array vazio quando não há repositórios', async () => {
    searchRepositories.mockResolvedValue({ repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 });
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'xyznotfound', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.body.data.searchRepositories.repositories).toEqual([]);
    expect(res.body.data.searchRepositories.totalCount).toBe(0);
  });

  it('deve retornar erro formatado quando o serviço lança AppError', async () => {
    const { AppError } = await import('../../utils/app-error.js');
    searchRepositories.mockRejectedValue(new AppError('API rate limit exceeded', 429));
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toBe('API rate limit exceeded');
    expect(res.body.errors[0].statusCode).toBe(429);
  });

  it('deve retornar erro genérico quando o serviço lança erro desconhecido', async () => {
    searchRepositories.mockRejectedValue(new Error('Internal'));
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc',
    });
    expect(res.body.errors).toBeDefined();
    expect(res.body.errors[0].message).toBe('Falha na execução da query GraphQL.');
    expect(res.body.errors[0].statusCode).toBe(500);
  });

  it('deve retornar erro de validação quando parâmetros obrigatórios estão ausentes', async () => {
    const res = await gql(`
      query {
        searchRepositories(query: "react") {
          totalCount
        }
      }
    `);
    expect(res.body.errors).toBeDefined();
  });

  it('deve chamar searchRepositories com os parâmetros corretos', async () => {
    searchRepositories.mockResolvedValue(reposPayload);
    const res = await gql(SEARCH_REPOS_QUERY, {
      query: 'angular', page: 2, perPage: 10, sort: 'forks', order: 'asc',
    });
    // Verifica que o serviço foi chamado e que o primeiro argumento contém os parâmetros corretos.
    // graphql chama resolvers como fn(args, context, info), então verificamos apenas o primeiro arg.
    expect(searchRepositories).toHaveBeenCalledTimes(1);
    const [firstArg] = searchRepositories.mock.calls[0];
    expect(firstArg).toMatchObject({ query: 'angular', page: 2, perPage: 10, sort: 'forks', order: 'asc' });
  });
});

// ─── searchIssues via GraphQL ─────────────────────────────────────────────────
describe('GraphQL: searchIssues', () => {
  it('deve retornar 200 com a lista de issues', async () => {
    searchIssues.mockResolvedValue(issuesPayload);
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    expect(res.status).toBe(200);
    expect(res.body.data.searchIssues.issues).toHaveLength(1);
    expect(res.body.data.searchIssues.issues[0].title).toBe('Fix memory leak in useEffect cleanup');
  });

  it('deve retornar os campos da issue corretamente', async () => {
    searchIssues.mockResolvedValue(issuesPayload);
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    const issue = res.body.data.searchIssues.issues[0];
    expect(issue.number).toBe(28456);
    expect(issue.state).toBe('open');
    expect(issue.comments).toBe(14);
    expect(issue.closed_at).toBeNull();
  });

  it('deve retornar user da issue corretamente', async () => {
    searchIssues.mockResolvedValue(issuesPayload);
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    const user = res.body.data.searchIssues.issues[0].user;
    expect(user.login).toBe('dev-user');
  });

  it('deve retornar labels da issue corretamente', async () => {
    searchIssues.mockResolvedValue(issuesPayload);
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    const labels = res.body.data.searchIssues.issues[0].labels;
    expect(labels).toHaveLength(2);
    expect(labels[0].name).toBe('bug');
    expect(labels[0].color).toBe('d73a4a');
  });

  it('deve retornar array vazio quando não há issues', async () => {
    searchIssues.mockResolvedValue({ issues: [], totalCount: 0, currentPage: 1, totalPages: 1 });
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'org/repo-vazio', page: 1, perPage: 10 });
    expect(res.body.data.searchIssues.issues).toEqual([]);
    expect(res.body.data.searchIssues.totalCount).toBe(0);
  });

  it('deve retornar erro formatado quando o serviço lança AppError', async () => {
    const { AppError } = await import('../../utils/app-error.js');
    searchIssues.mockRejectedValue(new AppError('Erro ao buscar issues no GitHub.', 502));
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    expect(res.body.errors[0].message).toBe('Erro ao buscar issues no GitHub.');
    expect(res.body.errors[0].statusCode).toBe(502);
  });

  it('deve retornar erro genérico para erros desconhecidos', async () => {
    searchIssues.mockRejectedValue(new Error('Crash'));
    const res = await gql(SEARCH_ISSUES_QUERY, { fullName: 'facebook/react', page: 1, perPage: 10 });
    expect(res.body.errors[0].message).toBe('Falha na execução da query GraphQL.');
  });

  it('deve chamar searchIssues com os parâmetros corretos', async () => {
    searchIssues.mockResolvedValue(issuesPayload);
    await gql(SEARCH_ISSUES_QUERY, { fullName: 'angular/angular', page: 2, perPage: 10 });
    expect(searchIssues).toHaveBeenCalledTimes(1);
    const [firstArg] = searchIssues.mock.calls[0];
    expect(firstArg).toMatchObject({ fullName: 'angular/angular', page: 2, perPage: 10 });
  });

  it('deve retornar erro de validação quando fullName está ausente', async () => {
    const res = await gql(`
      query {
        searchIssues(page: 1, perPage: 10) {
          totalCount
        }
      }
    `);
    expect(res.body.errors).toBeDefined();
  });
});
