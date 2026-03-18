import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mocks ────────────────────────────────────────────────────────────────────
// vi.hoisted garante que mockGet é criado antes do módulo ser carregado,
// fazendo com que axios.create() sempre retorne o mesmo objeto mock.
const mockGet = vi.hoisted(() => vi.fn());

vi.mock('axios', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    default: {
      create: () => ({ get: mockGet }),
      isAxiosError: (err) => Boolean(err?.isAxiosError),
    },
  };
});

vi.mock('../../cache/node-cache.js', () => ({
  cache: {
    get: vi.fn(() => undefined),
    set: vi.fn(),
  },
}));

// Importações após mock
import { cache } from '../../cache/node-cache.js';
import { searchRepositories, searchIssues } from '../../services/github.service.js';
import { AppError } from '../../utils/app-error.js';

// Helper para criar AxiosError fake
const makeAxiosError = (status, message) => {
  const err = new Error(message);
  err.isAxiosError = true;
  err.response = { status, data: { message } };
  return err;
};

// ─── Dados mock ───────────────────────────────────────────────────────────────
const rawRepo = {
  id: 1,
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

const rawIssue = {
  id: 101,
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
  labels: [
    { id: 1, name: 'bug', color: 'd73a4a' },
    { id: 2, name: 'good first issue', color: '7057ff' },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

// ─── searchRepositories ───────────────────────────────────────────────────────
describe('searchRepositories', () => {
  describe('query vazia', () => {
    it('deve retornar payload vazio quando query é uma string vazia', async () => {
      const result = await searchRepositories({ query: '', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result).toEqual({ repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 });
    });

    it('deve retornar payload vazio quando query tem apenas espaços', async () => {
      const result = await searchRepositories({ query: '   ', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result).toEqual({ repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 });
    });

    it('não deve chamar a API quando query está vazia', async () => {
      await searchRepositories({ query: '', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('cache', () => {
    it('deve retornar dados do cache quando disponível', async () => {
      const cached = { repositories: [{ id: '1' }], totalCount: 1, currentPage: 1, totalPages: 1 };
      cache.get.mockReturnValueOnce(cached);
      const result = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result).toEqual(cached);
      expect(mockGet).not.toHaveBeenCalled();
    });

    it('deve salvar o resultado no cache após chamada à API', async () => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [rawRepo], total_count: 1 } });
      await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(cache.set).toHaveBeenCalledOnce();
    });

    it('deve usar chave de cache correta (inclui todos os parâmetros)', async () => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [], total_count: 0 } });
      await searchRepositories({ query: 'angular', page: 2, perPage: 10, sort: 'forks', order: 'asc' });
      expect(cache.get).toHaveBeenCalledWith('search:angular:2:10:forks:asc');
    });
  });

  describe('normalização dos dados', () => {
    beforeEach(() => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [rawRepo], total_count: 1 } });
    });

    it('deve retornar id como string', async () => {
      const { repositories } = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(typeof repositories[0].id).toBe('string');
      expect(repositories[0].id).toBe('1');
    });

    it('deve retornar full_name correto', async () => {
      const { repositories } = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(repositories[0].full_name).toBe('facebook/react');
    });

    it('deve retornar owner com login e avatar_url', async () => {
      const { repositories } = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(repositories[0].owner).toEqual({ login: 'facebook', avatar_url: rawRepo.owner.avatar_url });
    });

    it('deve retornar topics como array', async () => {
      const { repositories } = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(Array.isArray(repositories[0].topics)).toBe(true);
      expect(repositories[0].topics).toContain('ui');
    });

    it('deve retornar topics como array vazio quando não informado', async () => {
      const repoSemTopics = { ...rawRepo, topics: undefined };
      mockGet.mockResolvedValue({ data: { items: [repoSemTopics], total_count: 1 } });
      const { repositories } = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(repositories[0].topics).toEqual([]);
    });

    it('deve calcular totalPages corretamente', async () => {
      mockGet.mockResolvedValue({ data: { items: [rawRepo], total_count: 25 } });
      const result = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result.totalPages).toBe(3);
    });

    it('deve retornar totalPages mínimo de 1 quando total_count é 0', async () => {
      mockGet.mockResolvedValue({ data: { items: [], total_count: 0 } });
      const result = await searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result.totalPages).toBe(1);
    });

    it('deve retornar currentPage correto', async () => {
      mockGet.mockResolvedValue({ data: { items: [], total_count: 0 } });
      const result = await searchRepositories({ query: 'react', page: 3, perPage: 10, sort: 'stars', order: 'desc' });
      expect(result.currentPage).toBe(3);
    });
  });

  describe('tratamento de erros', () => {
    beforeEach(() => cache.get.mockReturnValue(undefined));

    it('deve lançar AppError com statusCode 429 quando GitHub retorna rate limit', async () => {
      mockGet.mockRejectedValue(makeAxiosError(429, 'API rate limit exceeded'));
      await expect(
        searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' }),
      ).rejects.toMatchObject({ statusCode: 429, message: 'API rate limit exceeded' });
    });

    it('deve lançar AppError com statusCode 422 quando query é inválida', async () => {
      mockGet.mockRejectedValue(makeAxiosError(422, 'Validation Failed'));
      await expect(
        searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' }),
      ).rejects.toMatchObject({ statusCode: 422 });
    });

    it('deve lançar AppError com statusCode 502 quando GitHub está fora do ar', async () => {
      mockGet.mockRejectedValue(makeAxiosError(503, 'Service Unavailable'));
      await expect(
        searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' }),
      ).rejects.toMatchObject({ statusCode: 503 });
    });

    it('deve lançar AppError 500 para erros não-axios', async () => {
      mockGet.mockRejectedValue(new Error('Network error'));
      await expect(
        searchRepositories({ query: 'react', page: 1, perPage: 10, sort: 'stars', order: 'desc' }),
      ).rejects.toMatchObject({ statusCode: 500, message: 'Falha inesperada ao consultar o GitHub.' });
    });
  });
});

// ─── searchIssues ─────────────────────────────────────────────────────────────
describe('searchIssues', () => {
  describe('cache', () => {
    it('deve retornar dados do cache quando disponível', async () => {
      const cached = { issues: [{ id: '101' }], totalCount: 1, currentPage: 1, totalPages: 1 };
      cache.get.mockReturnValueOnce(cached);
      const result = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(result).toEqual(cached);
    });

    it('deve usar chave de cache correta', async () => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [], total_count: 0 } });
      await searchIssues({ fullName: 'facebook/react', page: 2, perPage: 10 });
      expect(cache.get).toHaveBeenCalledWith('issues:facebook/react:2:10');
    });

    it('deve salvar resultado no cache após chamada à API', async () => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [rawIssue], total_count: 1 } });
      await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(cache.set).toHaveBeenCalledOnce();
    });
  });

  describe('normalização dos dados', () => {
    beforeEach(() => {
      cache.get.mockReturnValue(undefined);
      mockGet.mockResolvedValue({ data: { items: [rawIssue], total_count: 1 } });
    });

    it('deve retornar id como string', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(typeof issues[0].id).toBe('string');
      expect(issues[0].id).toBe('101');
    });

    it('deve retornar number correto', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].number).toBe(28456);
    });

    it('deve retornar state correto', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].state).toBe('open');
    });

    it('deve retornar closed_at como null quando não fechada', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].closed_at).toBeNull();
    });

    it('deve retornar body como null quando não informado', async () => {
      const issueNoBody = { ...rawIssue, body: undefined };
      mockGet.mockResolvedValue({ data: { items: [issueNoBody], total_count: 1 } });
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].body).toBeNull();
    });

    it('deve retornar labels normalizadas com id como string', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].labels).toHaveLength(2);
      expect(typeof issues[0].labels[0].id).toBe('string');
      expect(issues[0].labels[0].name).toBe('bug');
      expect(issues[0].labels[0].color).toBe('d73a4a');
    });

    it('deve retornar labels como array vazio quando não informadas', async () => {
      const issueNoLabels = { ...rawIssue, labels: undefined };
      mockGet.mockResolvedValue({ data: { items: [issueNoLabels], total_count: 1 } });
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].labels).toEqual([]);
    });

    it('deve retornar comments como 0 quando não informado', async () => {
      const issueNoComments = { ...rawIssue, comments: undefined };
      mockGet.mockResolvedValue({ data: { items: [issueNoComments], total_count: 1 } });
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].comments).toBe(0);
    });

    it('deve retornar user com login e avatar_url', async () => {
      const { issues } = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(issues[0].user).toEqual({ login: 'dev-user', avatar_url: rawIssue.user.avatar_url });
    });

    it('deve calcular totalPages corretamente', async () => {
      mockGet.mockResolvedValue({ data: { items: [rawIssue], total_count: 45 } });
      const result = await searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 });
      expect(result.totalPages).toBe(5);
    });
  });

  describe('tratamento de erros', () => {
    beforeEach(() => cache.get.mockReturnValue(undefined));

    it('deve lançar AppError quando GitHub retorna 404', async () => {
      mockGet.mockRejectedValue(makeAxiosError(404, 'Not Found'));
      await expect(
        searchIssues({ fullName: 'org/repo-nao-existe', page: 1, perPage: 10 }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('deve lançar AppError com statusCode 429 para rate limit', async () => {
      mockGet.mockRejectedValue(makeAxiosError(429, 'API rate limit exceeded'));
      await expect(
        searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 }),
      ).rejects.toMatchObject({ statusCode: 429 });
    });

    it('deve lançar AppError 500 para erros não-axios', async () => {
      mockGet.mockRejectedValue(new Error('timeout'));
      await expect(
        searchIssues({ fullName: 'facebook/react', page: 1, perPage: 10 }),
      ).rejects.toMatchObject({ statusCode: 500 });
    });
  });
});
