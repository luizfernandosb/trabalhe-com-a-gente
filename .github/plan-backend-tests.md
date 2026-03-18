# Test Coverage Specification — Backend

Este documento define a **cobertura de testes que deve ser implementada** para o backend.

A IA ou desenvolvedor responsável deve **criar os arquivos de teste necessários utilizando Vitest e Supertest**, garantindo que todos os cenários listados sejam cobertos.

## Requisitos Gerais

Todos os testes devem seguir estas regras:

* Utilizar **Vitest** como framework de testes
* Utilizar **Supertest** para testes HTTP
* Utilizar **mocks** para dependências externas (axios, cache, serviços externos)
* Garantir **isolamento entre testes**
* Utilizar **describe / it** de forma organizada
* Garantir **nomes claros e descritivos**
* Evitar chamadas reais à API do GitHub
* Garantir que os testes sejam **determinísticos**

Estrutura esperada:

```
tests/
  utils/
  middlewares/
  routes/
  services/
  graphql/
```

---

# 1. Tests for `utils/app-error.js`

Criar o arquivo:

```
tests/utils/app-error.test.js
```

Testar a classe `AppError`, que estende o `Error` nativo e adiciona a propriedade `statusCode`.

## Cenários obrigatórios

| Caso | Descrição                                                   |
| ---- | ----------------------------------------------------------- |
| ☐    | Deve criar erro com mensagem e `statusCode` padrão `500`    |
| ☐    | Deve aceitar `statusCode` customizado (`404`, `401`, `502`) |
| ☐    | Deve ser instância de `AppError`                            |
| ☐    | Deve ser instância de `Error`                               |
| ☐    | Deve possuir `name === "AppError"`                          |
| ☐    | Deve possuir `stack` definido                               |

---

# 2. Tests for `middlewares/auth.middleware.js`

Criar:

```
tests/middlewares/auth.middleware.test.js
```

Testar o middleware de autenticação baseado em **Bearer Token**.

## Cenários obrigatórios

| Caso | Descrição                                                                |
| ---- | ------------------------------------------------------------------------ |
| ☐    | Deve retornar `401` quando o header `Authorization` não estiver presente |
| ☐    | Deve retornar `401` quando o esquema não for `Bearer`                    |
| ☐    | Deve retornar `401` quando o token for inválido                          |
| ☐    | Deve retornar `401` quando o token estiver vazio após `Bearer `          |
| ☐    | Deve permitir acesso quando o token for válido                           |
| ☐    | Deve bloquear requisições GraphQL sem token (`POST /graphql`)            |

---

# 3. Tests for `middlewares/error-handler.js`

Criar:

```
tests/middlewares/error-handler.test.js
```

Testar o middleware global de tratamento de erros do Express.

## Cenários obrigatórios

| Caso | Descrição                                                      |
| ---- | -------------------------------------------------------------- |
| ☐    | Rotas saudáveis não devem acionar o error handler (smoke test) |

---

# 4. Tests for `routes/health.js`

Criar:

```
tests/routes/health.test.js
```

Testar o endpoint de **health check** da API.

## Cenários obrigatórios

| Caso | Descrição                                  |
| ---- | ------------------------------------------ |
| ☐    | `GET /api/health` retorna `200`            |
| ☐    | Response body deve ser `{ status: "ok" }`  |
| ☐    | `Content-Type` deve ser `application/json` |
| ☐    | Rota inexistente deve retornar `404`       |

---

# 5. Tests for `services/github.service.js`

Criar:

```
tests/services/github.service.test.js
```

Testar o serviço que consome a **API do GitHub**.

### Regras

* **axios deve ser mockado**
* **cache deve ser mockado**
* Nenhuma chamada externa real deve ocorrer

---

# 5.1 `searchRepositories`

## Query vazia

| Caso | Descrição                                                          |
| ---- | ------------------------------------------------------------------ |
| ☐    | Deve retornar payload vazio quando `query` for string vazia        |
| ☐    | Deve retornar payload vazio quando `query` contiver apenas espaços |
| ☐    | Não deve chamar a API quando `query` estiver vazia                 |

---

## Cache

| Caso | Descrição                                                            |
| ---- | -------------------------------------------------------------------- |
| ☐    | Deve retornar dados do cache quando disponíveis                      |
| ☐    | Não deve chamar a API quando houver cache                            |
| ☐    | Deve salvar resultado no cache após chamada                          |
| ☐    | Deve utilizar chave `search:{query}:{page}:{perPage}:{sort}:{order}` |

---

## Normalização dos dados

| Caso | Descrição                                                     |
| ---- | ------------------------------------------------------------- |
| ☐    | `id` deve ser convertido para `string`                        |
| ☐    | Deve retornar `full_name` corretamente                        |
| ☐    | Deve retornar `owner.login`                                   |
| ☐    | Deve retornar `owner.avatar_url`                              |
| ☐    | `topics` deve ser sempre um array                             |
| ☐    | Deve calcular `totalPages` corretamente                       |
| ☐    | `totalPages` mínimo deve ser `1` quando `total_count` for `0` |
| ☐    | Deve retornar `currentPage` correto                           |

---

## Tratamento de erros

| Caso | Descrição                                                   |
| ---- | ----------------------------------------------------------- |
| ☐    | Deve lançar `AppError 429` para rate limit                  |
| ☐    | Deve lançar `AppError 422` para query inválida              |
| ☐    | Deve lançar `AppError 503` quando GitHub estiver fora do ar |
| ☐    | Deve lançar `AppError 500` para erros não-axios             |

---

# 5.2 `searchIssues`

## Cache

| Caso | Descrição                                            |
| ---- | ---------------------------------------------------- |
| ☐    | Deve retornar dados do cache                         |
| ☐    | Deve usar chave `issues:{fullName}:{page}:{perPage}` |
| ☐    | Deve salvar resultado no cache                       |

---

## Normalização dos dados

| Caso | Descrição                                        |
| ---- | ------------------------------------------------ |
| ☐    | `id` deve ser string                             |
| ☐    | Deve retornar `number`, `state`, `closed_at`     |
| ☐    | `body` deve ser `null` quando ausente            |
| ☐    | Deve normalizar `labels` (`id`, `name`, `color`) |
| ☐    | `labels` deve ser array vazio quando ausente     |
| ☐    | `comments` deve ser `0` quando ausente           |
| ☐    | Deve retornar `user.login`                       |
| ☐    | Deve retornar `user.avatar_url`                  |
| ☐    | Deve calcular `totalPages` corretamente          |

---

## Tratamento de erros

| Caso | Descrição                                                 |
| ---- | --------------------------------------------------------- |
| ☐    | Deve lançar `AppError 404` quando repositório não existir |
| ☐    | Deve lançar `AppError 429` para rate limit                |
| ☐    | Deve lançar `AppError 500` para erros desconhecidos       |

---

# 6. GraphQL Integration Tests

Criar:

```
tests/graphql/graphql.test.js
```

Estes testes devem validar a camada **GraphQL via HTTP**, utilizando **mock do serviço**.

---

# 6.1 Query `searchRepositories`

| Caso | Descrição                                                     |
| ---- | ------------------------------------------------------------- |
| ☐    | Deve retornar `200` com lista de repositórios                 |
| ☐    | Deve retornar `totalCount` correto                            |
| ☐    | Deve retornar `currentPage`                                   |
| ☐    | Deve retornar `totalPages`                                    |
| ☐    | Deve retornar campos de `owner` corretamente                  |
| ☐    | Deve retornar array vazio quando não houver resultados        |
| ☐    | Deve retornar erro formatado quando serviço lançar `AppError` |
| ☐    | Deve retornar erro `500` para erros desconhecidos             |
| ☐    | Deve validar parâmetros obrigatórios                          |
| ☐    | Deve chamar o serviço com parâmetros corretos                 |

---

# 6.2 Query `searchIssues`

| Caso | Descrição                                                     |
| ---- | ------------------------------------------------------------- |
| ☐    | Deve retornar `200` com lista de issues                       |
| ☐    | Deve retornar `number`, `state`, `comments`, `closed_at`      |
| ☐    | Deve retornar `user.login` e `user.avatar_url`                |
| ☐    | Deve retornar `labels` corretamente                           |
| ☐    | Deve retornar array vazio quando não houver issues            |
| ☐    | Deve retornar erro formatado quando serviço lançar `AppError` |
| ☐    | Deve retornar erro `500` para erros desconhecidos             |
| ☐    | Deve chamar serviço com parâmetros corretos                   |
| ☐    | Deve retornar erro quando `fullName` estiver ausente          |

