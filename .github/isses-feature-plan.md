# Plano: Página de Issues do Repositório

Adicionar uma nova página que exibe as issues de um repositório quando o usuário clicar em um card. A feature exige alterações no **backend** (nova query GraphQL + service) e no **frontend** (nova rota, página, componentes e navegação).

---

## Endpoint

O endpoint utilizado para buscar as issues é:

```
GET https://api.github.com/search/issues?q=repo:{owner}/{repo}
```

O `owner` e o `repo` são extraídos do campo `full_name` do repositório retornado pelo endpoint de busca (`/search/repositories`). O `full_name` tem o formato `owner/repo` (ex: `facebook/react`).

---

## Modelo de Retorno das Issues (GitHub API)

```json
{
  "total_count": 33550,
  "incomplete_results": false,
  "items": [
    {
      "id": 4091473577,
      "number": 36056,
      "title": "Bug:",
      "html_url": "https://github.com/facebook/react/issues/36056",
      "state": "open",
      "comments": 0,
      "created_at": "2026-03-17T22:14:21Z",
      "updated_at": "2026-03-17T22:14:21Z",
      "closed_at": null,
      "body": "...",
      "user": {
        "login": "siraprepaninnama-lab",
        "avatar_url": "https://avatars.githubusercontent.com/u/269039825?v=4"
      },
      "labels": [
        {
          "id": 155984160,
          "name": "Status: Unconfirmed",
          "color": "d4c5f9"
        }
      ]
    }
  ]
}
```

### Campos mapeados na normalização

| Campo GitHub API | Campo normalizado | Tipo |
|---|---|---|
| `id` | `id` | String |
| `number` | `number` | Int |
| `title` | `title` | String |
| `state` | `state` | String (`open` / `closed`) |
| `html_url` | `html_url` | String |
| `created_at` | `created_at` | String |
| `updated_at` | `updated_at` | String |
| `closed_at` | `closed_at` | String (nullable) |
| `body` | `body` | String (nullable) |
| `comments` | `comments` | Int |
| `user.login` | `user.login` | String |
| `user.avatar_url` | `user.avatar_url` | String |
| `labels[].id` | `labels[].id` | String |
| `labels[].name` | `labels[].name` | String |
| `labels[].color` | `labels[].color` | String |

---

## Passo a Passo

### 1. Backend — Estender o schema GraphQL

**Arquivo:** `backend/src/graphql/schema/index.js`

Adicionar os novos tipos e a query `searchIssues`:

- `IssueUser` — `login`, `avatar_url`
- `IssueLabel` — `id`, `name`, `color`
- `Issue` — `id`, `number`, `title`, `state`, `html_url`, `created_at`, `updated_at`, `body`, `comments`, `user` (IssueUser), `labels` ([IssueLabel])
- `SearchIssuesPayload` — `issues` ([Issue]), `totalCount`, `currentPage`, `totalPages`
- Query: `searchIssues(owner: String!, repo: String!, page: Int!, perPage: Int!): SearchIssuesPayload!`

---

### 2. Backend — Criar o service `searchIssues`

**Arquivo:** `backend/src/services/github.service.js`

- Chamar `GET /search/issues?q=repo:{owner}/{repo}&page=&per_page=`
- Normalizar cada issue: `id`, `number`, `title`, `state`, `html_url`, `created_at`, `updated_at`, `body`, `comments`, `user`, `labels`
- Aplicar cache com chave: `issues:{owner}:{repo}:{page}:{perPage}` (TTL de 60 segundos)
- Tratar erros com `AppError`

---

### 3. Backend — Registrar o resolver

**Arquivo:** `backend/src/graphql/resolvers/index.js`

Adicionar:

```js
searchIssues: async ({ owner, repo, page, perPage }) =>
  searchIssues({ owner, repo, page, perPage }),
```

---

### 4. Frontend — Adicionar model e método na API

**Arquivo:** `frontend/src/app/core/models/repository.model.ts`

Adicionar as interfaces:
- `IssueUser` — `login`, `avatar_url`
- `IssueLabel` — `id`, `name`, `color`
- `Issue` — `id`, `number`, `title`, `state`, `html_url`, `created_at`, `updated_at`, `body`, `comments`, `user`, `labels`
- `SearchIssuesResponse` — `issues`, `totalCount`, `currentPage`, `totalPages`

**Arquivo:** `frontend/src/app/core/services/github-search-api.service.ts`

Adicionar o método `searchIssues(owner, repo, page, perPage)` que chama a nova query GraphQL.

---

### 5. Frontend — Criar a feature `repository`

Criar a estrutura de pastas:

```
src/app/features/repository/
  models/
    issue-filters.model.ts         → tipos para page e perPage
  components/
    issue-card/
      issue-card.component.ts
      issue-card.component.html
      issue-card.component.scss    → exibe: número, título, badge de estado,
                                     labels, avatar do autor e data de criação
  pages/
    issues-page/
      issues-page.component.ts     → lê :owner e :repo dos route params,
                                     busca issues reativamente com BehaviorSubject
                                     para paginação, renderiza IssueCardComponent
                                     e MatPaginator
      issues-page.component.html
      issues-page.component.scss
```

---

### 6. Frontend — Configurar rota e navegação

**Arquivo:** `frontend/src/app/app.routes.ts`

Adicionar a rota (com lazy loading):

```ts
{
  path: 'repository/:owner/:repo/issues',
  loadComponent: () =>
    import('./features/repository/pages/issues-page/issues-page.component')
      .then(m => m.IssuesPageComponent),
}
```

**Arquivo:** `frontend/src/app/features/search/components/repository-card/repository-card.component.ts`

- Injetar `Router`
- Adicionar método `openIssues()` que navega para `/repository/{owner}/{repo}/issues`

**Arquivo:** `frontend/src/app/features/search/components/repository-card/repository-card.component.html`

- Adicionar botão/área clicável no card que chama `openIssues()`
- Manter o link externo existente para o repositório no GitHub

---

## Pontos de Atenção

| # | Ponto | Descrição |
|---|-------|-----------|
| 1 | **Contagem de issues no card** | Exibir `open_issues_count` no card de repositório exige adicionar o campo no schema GraphQL, em `normalizeRepository` e no template do card |
| 2 | **Filtros na página de issues** | A API do GitHub suporta `is:open` / `is:closed` no parâmetro `q`. Pode-se adicionar um select de estado (aberta/fechada) como filtro futuro |
| 3 | **Estados vazios e de erro** | A página de issues deve exibir estado amigável quando não houver issues e estado de erro em caso de falha na API, seguindo o mesmo padrão visual da página de busca |
| 4 | **Botão de voltar** | Adicionar botão de navegação de volta para a página de busca na página de issues |
