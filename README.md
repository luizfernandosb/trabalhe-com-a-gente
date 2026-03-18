# 🔍 GitHub Repository Search

Aplicação full-stack para pesquisar repositórios e issues no GitHub, com paginação, filtros, ordenação e histórico de buscas.

---

## 📸 Visão Geral

| Tela | Descrição |
|------|-----------|
| Busca | Pesquise repositórios em tempo real com debounce |
| Resultados | Cards com nome, descrição, linguagem, estrelas, topics e data |
| Issues | Lista paginada de issues abertas e fechadas de cada repositório |

---

## 🏗️ Arquitetura

```
/
├── backend/        Node.js + Express + GraphQL (camada intermediária)
└── frontend/       Angular 21 SPA
```

**Fluxo:**
```
frontend/.env  →  scripts/set-env.js  →  environment.ts
                                              ↓
Browser (Angular) → [Bearer Token] → Backend (GraphQL) → [API Key] → GitHub API
```

O backend funciona como proxy seguro: o token da API do GitHub **nunca** é exposto ao browser.  
O token de autenticação interna é lido do `frontend/.env` e injetado no `environment.ts` em tempo de build — o arquivo `.env` nunca vai para o repositório.

---

## 🚀 Como executar

### Pré-requisitos

- Node.js >= 18
- npm >= 9

### 1. Backend

```bash
cd backend
cp .env.example .env
```

Edite o `.env` e preencha:

| Variável | Descrição |
|----------|-----------|
| `GITHUB_API_KEY` | Token de acesso gerado em [github.com/settings/tokens](https://github.com/settings/tokens). Aumenta o rate limit de 60 para 5.000 req/h |
| `API_TOKEN` | Token interno entre frontend e backend. Use qualquer string segura (ex: UUID) |
| `PORT` | Porta do servidor (padrão: `3000`) |
| `CORS_ORIGIN` | URL do frontend (padrão: `http://localhost:4200`) |
| `CACHE_TTL_SECONDS` | Tempo de cache em segundos (padrão: `60`) |

```bash
npm install
npm run dev
```

O servidor estará disponível em `http://localhost:3000`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env
```

Edite o `.env` e preencha com o **mesmo** `API_TOKEN` definido no backend:

| Variável | Descrição |
|----------|-----------|
| `API_TOKEN` | Deve ser idêntico ao `API_TOKEN` do `backend/.env` |

```bash
npm install
npm start
```

O script `npm start` executa automaticamente `node scripts/set-env.js`, que lê o `.env` e gera o arquivo `src/environments/environment.ts` com o token. A aplicação estará disponível em `http://localhost:4200`.

> O frontend está configurado com um proxy (`proxy.conf.json`) que redireciona `/graphql` para `http://localhost:3000/graphql`.

> **Nunca** edite `src/environments/environment.ts` manualmente — ele é gerado automaticamente.

---

## 🧪 Testes

### Backend (Vitest)

```bash
cd backend
npm test               # executa todos os testes
npm run test:watch     # modo watch
npm run test:coverage  # com relatório de cobertura
```

### Frontend — E2E (Cypress)

```bash
# Modo interativo (requer o frontend rodando)
cd frontend
npm run e2e

# Modo headless (CI)
npm run e2e:run
```

---

## 📡 API GraphQL

O backend expõe dois endpoints via `POST /graphql`:

### `searchRepositories`

```graphql
query SearchRepositories(
  $query: String!
  $page: Int!
  $perPage: Int!
  $sort: String!    # stars | forks | help-wanted-issues | updated
  $order: String!   # asc | desc
) {
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
      owner { login  avatar_url }
    }
  }
}
```

### `searchIssues`

```graphql
query SearchIssues($fullName: String!, $page: Int!, $perPage: Int!) {
  searchIssues(fullName: $fullName, page: $page, perPage: $perPage) {
    totalCount
    currentPage
    totalPages
    issues {
      id  number  title  state  html_url
      created_at  updated_at  closed_at
      body  comments
      user   { login  avatar_url }
      labels { id  name  color }
    }
  }
}
```

---

## 🔐 Segurança

- **Helmet**: headers HTTP de segurança em todas as respostas
- **Rate limiting**: máximo de 100 requisições por IP a cada 15 minutos
- **CORS**: apenas a origem configurada em `CORS_ORIGIN` é aceita
- **Bearer Token**: todas as rotas exigem autenticação com o `API_TOKEN`
- **Variáveis de ambiente**: tokens lidos de arquivos `.env` (nunca commitados) via `scripts/set-env.js`
- **Validação de input**: parâmetros `sort` e `order` são validados contra listas de valores permitidos
- **Token GitHub**: nunca exposto ao browser — permanece apenas no backend

---

## 🛠️ Stack

| Camada | Tecnologias |
|--------|-------------|
| Frontend | Angular 21, Angular Material, RxJS |
| Testes E2E | Cypress |
| Testes unitários frontend | Vitest (via `@angular/build:unit-test`) |
| Backend | Node.js, Express 5, GraphQL HTTP |
| Cache | node-cache |
| Segurança | helmet, express-rate-limit |
| Testes backend | Vitest, Supertest |
