import { buildSchema } from 'graphql';

const schema = buildSchema(`
  type Owner {
    login: String!
    avatar_url: String!
  }

  type Repository {
    id: ID!
    full_name: String!
    description: String
    html_url: String!
    language: String
    stargazers_count: Int!
    watchers_count: Int!
    topics: [String!]!
    updated_at: String!
    owner: Owner!
  }

  type SearchRepositoriesPayload {
    repositories: [Repository!]!
    totalCount: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type IssueUser {
    login: String!
    avatar_url: String!
  }

  type IssueLabel {
    id: ID!
    name: String!
    color: String!
  }

  type Issue {
    id: ID!
    number: Int!
    title: String!
    state: String!
    html_url: String!
    created_at: String!
    updated_at: String!
    closed_at: String
    body: String
    comments: Int!
    user: IssueUser!
    labels: [IssueLabel!]!
  }

  type SearchIssuesPayload {
    issues: [Issue!]!
    totalCount: Int!
    currentPage: Int!
    totalPages: Int!
  }

  type Query {
    searchRepositories(
      query: String!
      page: Int!
      perPage: Int!
      sort: String!
      order: String!
    ): SearchRepositoriesPayload!

    searchIssues(
      fullName: String!
      page: Int!
      perPage: Int!
    ): SearchIssuesPayload!
  }
`);

export { schema };
