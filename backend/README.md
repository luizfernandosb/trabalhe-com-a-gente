# Backend — GitHub Repository Search

Camada intermediária entre o frontend Angular e a API pública do GitHub. Expõe endpoints **GraphQL** com autenticação, cache e rate limiting.

---

## 🚀 Executando

```bash
cp .env.example .env
# Preencha as variáveis no .env
npm install
npm run dev
```

## 🧪 Testes

```bash
npm test                # executa todos os testes (Vitest)
npm run test:watch      # modo watch
npm run test:coverage   # com relatório de cobertura (lcov)
```

## 📁 Estrutura

```
src/
  config/         Variáveis de ambiente e configuração
  cache/          Instância do node-cache com TTL configurável
  controllers/    Controladores de rota REST
  graphql/
    schema/       Definição dos tipos GraphQL
    resolvers/    Resolvers que delegam aos services
  middlewares/    Autenticação (Bearer), rate limit, error handler
  routes/         Rotas REST (/api/health)
  services/       Regras de negócio e chamadas à API do GitHub
  utils/          AppError — classe de erro tipado
  __tests__/      Testes unitários e de integração
```

## 🔐 Variáveis de Ambiente

Veja [.env.example](.env.example) para referência completa.

| Variável | Obrigatória | Padrão |
|----------|-------------|--------|
| `GITHUB_API_KEY` | ✅ | — |
| `API_TOKEN` | ✅ | — |
| `PORT` | ❌ | `3000` |
| `CORS_ORIGIN` | ❌ | `http://localhost:4200` |
| `CACHE_TTL_SECONDS` | ❌ | `60` |
| `NODE_ENV` | ❌ | `development` |
