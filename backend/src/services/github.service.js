import axios from 'axios';
import { cache } from '../cache/node-cache.js';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

const githubClient = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Accept: 'application/vnd.github+json',
    ...(env.GITHUB_API_KEY ? { Authorization: `Bearer ${env.GITHUB_API_KEY}` } : {}),
  },
});

const withCache = async (key, fn) => {
  const cached = cache.get(key);
  if (cached) return cached;
  const result = await fn();
  cache.set(key, result);
  return result;
};

const handleGithubError = (error, fallbackMessage) => {
  if (axios.isAxiosError(error)) {
    const statusCode = error.response?.status ?? 502;
    const message = error.response?.data?.message ?? fallbackMessage;
    throw new AppError(message, statusCode);
  }
  throw new AppError('Falha inesperada ao consultar o GitHub.', 500);
};

const normalizeRepository = (repository) => ({
  id: String(repository.id),
  full_name: repository.full_name,
  description: repository.description,
  html_url: repository.html_url,
  language: repository.language,
  stargazers_count: repository.stargazers_count,
  watchers_count: repository.watchers_count,
  topics: repository.topics || [],
  updated_at: repository.updated_at,
  owner: {
    login: repository.owner?.login || '',
    avatar_url: repository.owner?.avatar_url || '',
  },
});

const searchRepositories = async ({ query, page, perPage, sort, order }) => {
  const normalizedQuery = String(query || '').trim();

  if (!normalizedQuery) {
    return { repositories: [], totalCount: 0, currentPage: 1, totalPages: 1 };
  }

  validateSearchInput({ sort, order, perPage });

  const cacheKey = `search:${normalizedQuery}:${page}:${perPage}:${sort}:${order}`;

  try {
    return await withCache(cacheKey, async () => {
      const { data } = await githubClient.get('/search/repositories', {
        params: { q: normalizedQuery, page, per_page: perPage, sort, order },
      });

      return {
        repositories: data.items.map(normalizeRepository),
        totalCount: data.total_count,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(data.total_count / perPage)),
      };
    });
  } catch (error) {
    handleGithubError(error, 'Erro ao buscar dados no GitHub.');
  }
};

const normalizeIssue = (issue) => ({
  id: String(issue.id),
  number: issue.number,
  title: issue.title,
  state: issue.state,
  html_url: issue.html_url,
  created_at: issue.created_at,
  updated_at: issue.updated_at,
  closed_at: issue.closed_at || null,
  body: issue.body || null,
  comments: issue.comments || 0,
  user: {
    login: issue.user?.login || '',
    avatar_url: issue.user?.avatar_url || '',
  },
  labels: (issue.labels || []).map((label) => ({
    id: String(label.id),
    name: label.name,
    color: label.color,
  })),
});

const ALLOWED_SORT = ['stars', 'forks', 'help-wanted-issues', 'updated'];
const ALLOWED_ORDER = ['asc', 'desc'];
const MAX_PER_PAGE = 100;

const validateSearchInput = ({ sort, order, perPage }) => {
  if (!ALLOWED_SORT.includes(sort)) throw new AppError(`Invalid sort value: "${sort}".`, 400);
  if (!ALLOWED_ORDER.includes(order)) throw new AppError(`Invalid order value: "${order}".`, 400);
  if (perPage > MAX_PER_PAGE) throw new AppError(`perPage cannot exceed ${MAX_PER_PAGE}.`, 400);
};

// fullName = "owner/repo" (campo full_name vindo do endpoint /search/repositories)
const searchIssues = async ({ fullName, page, perPage }) => {
  const cacheKey = `issues:${fullName}:${page}:${perPage}`;

  try {
    return await withCache(cacheKey, async () => {
      const response = await githubClient.get('/search/issues', {
        params: {
          q: `repo:${fullName}`,
          page,
          per_page: perPage,
        },
      });

      return {
        issues: response.data.items.map(normalizeIssue),
        totalCount: response.data.total_count,
        currentPage: page,
        totalPages: Math.max(1, Math.ceil(response.data.total_count / perPage)),
      };
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 502;
      const message = error.response?.data?.message || 'Erro ao buscar issues no GitHub.';
      throw new AppError(message, statusCode);
    }

    throw new AppError('Falha inesperada ao consultar issues do GitHub.', 500);
  }
};

export { searchRepositories, searchIssues };
