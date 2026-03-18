# Frontend — GitHub Repository Search

SPA Angular 21 para pesquisar repositórios e issues no GitHub.

---

## 🚀 Executando

```bash
npm install
npm start
```

Acesse em `http://localhost:4200`. Requer o [backend](../backend/README.md) rodando na porta `3000`.

## 🧪 Testes

```bash
# Unitários (Vitest via Angular build)
npm test

# E2E interativo (requer a app rodando)
npm run e2e

# E2E headless (CI)
npm run e2e:run
```

## 📁 Estrutura

```
src/app/
  core/
    interceptors/   authInterceptor — adiciona Bearer token em todas as requisições
    models/         Interfaces TypeScript (Repository, Issue, etc.)
    services/       GithubSearchApiService — cliente GraphQL
  features/
    search/
      components/   RepositoryCardComponent
      pages/        SearchPageComponent
      services/     SearchStateService, SearchHistoryService
      models/       SearchFilters
    repository/
      components/   IssueCardComponent
      pages/        IssuesPageComponent
      models/       IssueFilters
  layout/
    components/     TopbarComponent (busca + filtros)
```

## 🏗️ Arquitetura

- **SearchStateService** centraliza todo o estado da busca: query, página, sort, order, loading e histórico
- **RxJS**: `combineLatest` + `switchMap` + `debounceTime` + `distinctUntilChanged` para controle de requisições
- **Angular Material Paginator** para paginação com `per_page=10`
- **Standalone Components** em todo o projeto (sem NgModules)

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
