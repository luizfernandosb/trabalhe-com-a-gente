export interface GithubUser {
  login: string;
  avatar_url: string;
}

export type Owner = GithubUser;

export interface Repository {
  id: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  topics: string[];
  updated_at: string;
  owner: Owner;
}

export interface SearchRepositoriesResponse {
  repositories: Repository[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

export type IssueUser = GithubUser;

export interface IssueLabel {
  id: string;
  name: string;
  color: string;
}

export interface Issue {
  id: string;
  number: number;
  title: string;
  state: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  body: string | null;
  comments: number;
  user: IssueUser;
  labels: IssueLabel[];
}

export interface SearchIssuesResponse {
  issues: Issue[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}
