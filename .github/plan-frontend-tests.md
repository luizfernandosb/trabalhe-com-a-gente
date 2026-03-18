# Frontend E2E Test Specification

Este documento define a **cobertura de testes End-to-End que deve ser implementada no frontend**.

Os testes devem ser escritos utilizando **Cypress** e devem validar os principais fluxos da aplicação.

## Requisitos Gerais

Os testes devem seguir as seguintes regras:

* Utilizar **Cypress** como framework de testes E2E
* Todas as requisições **GraphQL devem ser interceptadas**
* Utilizar `cy.intercept` para simular respostas da API
* As respostas devem vir de **fixtures locais**
* Nenhuma chamada real à API deve ser executada
* Garantir que os testes sejam **determinísticos**
* Utilizar **Page Objects ou helpers quando necessário**
* Cada teste deve ser **independente**

Estrutura esperada:

```
cypress/
  e2e/
    search.cy.ts
    filters.cy.ts
    pagination.cy.ts
    repository-card.cy.ts
    issues.cy.ts
  fixtures/
```

---

# 1. Repository Search Tests

Criar o arquivo:

```
cypress/e2e/search.cy.ts
```

Testar o fluxo principal de **busca de repositórios**.

## Estado inicial

| Caso | Descrição                                                        |
| ---- | ---------------------------------------------------------------- |
| ☐    | Deve exibir o estado vazio com o texto `Search for repositories` |
| ☐    | Deve exibir o campo de busca na topbar                           |
| ☐    | Deve exibir o botão de busca na topbar                           |
| ☐    | Não deve exibir cards de repositório antes da pesquisa           |

---

## Validação do campo de busca

| Caso | Descrição                                                      |
| ---- | -------------------------------------------------------------- |
| ☐    | Botão de busca deve permanecer desabilitado com campo vazio    |
| ☐    | Botão deve ser habilitado quando texto for digitado            |
| ☐    | Botão deve voltar a ficar desabilitado ao limpar o campo       |
| ☐    | Não deve executar busca ao pressionar Enter com apenas espaços |

---

## Execução da pesquisa

| Caso | Descrição                                                                  |
| ---- | -------------------------------------------------------------------------- |
| ☐    | Deve executar a busca ao pressionar Enter                                  |
| ☐    | Deve executar a busca ao clicar no botão Search                            |
| ☐    | Deve remover espaços em branco no início e no fim da query antes de enviar |
| ☐    | Deve esconder o estado vazio após busca com resultados                     |
| ☐    | Deve exibir spinner durante o carregamento                                 |
| ☐    | Deve exibir contador e label de resultados após a busca                    |
| ☐    | Deve exibir a mensagem `No results` quando a API retornar lista vazia      |

---

## Skeleton de carregamento

| Caso | Descrição                                                       |
| ---- | --------------------------------------------------------------- |
| ☐    | Deve exibir skeleton cards enquanto a resposta da API não chega |
| ☐    | Deve remover skeleton e exibir os cards após a resposta         |

---

# 2. Filters Tests

Criar o arquivo:

```
cypress/e2e/filters.cy.ts
```

Testar os **filtros de ordenação e direção** disponíveis na interface.

## Presença dos filtros

| Caso | Descrição                                                                           |
| ---- | ----------------------------------------------------------------------------------- |
| ☐    | Deve exibir os selects `Sort by` e `Order by` na topbar                             |
| ☐    | Select Sort deve conter as opções `stars`, `forks`, `help-wanted-issues`, `updated` |
| ☐    | Select Order deve conter as opções `desc` e `asc`                                   |
| ☐    | Valor padrão do Sort deve ser `stars`                                               |
| ☐    | Valor padrão do Order deve ser `desc`                                               |

---

## Comportamento dos filtros

| Caso | Descrição                                                     |
| ---- | ------------------------------------------------------------- |
| ☐    | Deve enviar o parâmetro `sort` correto na query GraphQL       |
| ☐    | Deve enviar o parâmetro `order` correto na query GraphQL      |
| ☐    | Deve disparar nova busca ao alterar o Sort após uma pesquisa  |
| ☐    | Deve disparar nova busca ao alterar o Order após uma pesquisa |
| ☐    | Deve enviar corretamente `sort=updated`                       |
| ☐    | Deve enviar corretamente `sort=help-wanted-issues`            |
| ☐    | Deve reiniciar a paginação para `page=1` ao alterar filtros   |

---

# 3. Pagination Tests

Criar o arquivo:

```
cypress/e2e/pagination.cy.ts
```

Testar a paginação implementada com **Angular Material Paginator**.

## Exibição do paginador

| Caso | Descrição                                                     |
| ---- | ------------------------------------------------------------- |
| ☐    | Deve exibir o paginador quando houver resultados              |
| ☐    | Deve exibir o total de resultados (`totalCount`) no paginador |
| ☐    | Não deve exibir seletor de itens por página                   |

---

## Navegação entre páginas

| Caso | Descrição                                                        |
| ---- | ---------------------------------------------------------------- |
| ☐    | Deve navegar para a próxima página ao clicar em `Next page`      |
| ☐    | Deve enviar `page=2` na query GraphQL                            |
| ☐    | Deve exibir corretamente os repositórios da página 2             |
| ☐    | Deve enviar `perPage=10` na query GraphQL                        |
| ☐    | Deve resetar para `page=1` ao executar nova busca                |
| ☐    | Botão `Previous page` deve estar desabilitado na primeira página |
| ☐    | Botão `Previous page` deve ser habilitado ao ir para a página 2  |
| ☐    | Deve voltar para `page=1` ao clicar em `Previous page`           |

---

# 4. Repository Card Tests

Criar o arquivo:

```
cypress/e2e/repository-card.cy.ts
```

Testar a renderização e comportamento dos **cards de repositório**.

## Exibição dos dados

| Caso | Descrição                                                    |
| ---- | ------------------------------------------------------------ |
| ☐    | Deve exibir o `full_name` do repositório                     |
| ☐    | Deve exibir o avatar do owner                                |
| ☐    | Deve exibir badge `Public`                                   |
| ☐    | Deve exibir descrição do repositório                         |
| ☐    | Deve exibir linguagem do repositório                         |
| ☐    | Deve exibir ponto colorido da linguagem                      |
| ☐    | Deve exibir contagem de estrelas formatada                   |
| ☐    | Deve exibir topics do repositório                            |
| ☐    | Deve limitar topics a no máximo 5                            |
| ☐    | Deve exibir data da última atualização                       |
| ☐    | Deve exibir link externo para o GitHub com `target="_blank"` |

---

## Comportamento de clique

| Caso | Descrição                                                             |
| ---- | --------------------------------------------------------------------- |
| ☐    | Deve navegar para `/repository/:owner/:repo/issues` ao clicar no card |
| ☐    | Link externo não deve disparar navegação do card (stopPropagation)    |

---

## Múltiplos repositórios

| Caso | Descrição                                           |
| ---- | --------------------------------------------------- |
| ☐    | Deve renderizar múltiplos cards de repositório      |
| ☐    | Cada card deve representar um repositório diferente |

---

# 5. Issues Page Tests

Criar o arquivo:

```
cypress/e2e/issues.cy.ts
```

Testar a página de **issues de um repositório**.

---

## Breadcrumb e cabeçalho

| Caso | Descrição                                          |
| ---- | -------------------------------------------------- |
| ☐    | Deve exibir `Repositories` no breadcrumb           |
| ☐    | Deve exibir nome do repositório no breadcrumb      |
| ☐    | Deve exibir `Issues` como item atual               |
| ☐    | Link `Repositories` deve apontar para `/`          |
| ☐    | Deve navegar para home ao clicar em `Repositories` |

---

## Loading spinner

| Caso | Descrição                                    |
| ---- | -------------------------------------------- |
| ☐    | Deve exibir spinner enquanto issues carregam |
| ☐    | Deve remover spinner após resposta da API    |

---

## Exibição das issues

| Caso | Descrição                                             |
| ---- | ----------------------------------------------------- |
| ☐    | Deve exibir contagem de issues abertas                |
| ☐    | Deve renderizar lista de issues                       |
| ☐    | Deve exibir título da issue                           |
| ☐    | Deve exibir número da issue                           |
| ☐    | Deve exibir autor da issue                            |
| ☐    | Deve exibir labels                                    |
| ☐    | Deve exibir ícone verde para issues abertas           |
| ☐    | Deve exibir ícone roxo para issues fechadas           |
| ☐    | Deve exibir data de abertura                          |
| ☐    | Deve exibir data de fechamento para issues fechadas   |
| ☐    | Deve exibir contador de comentários quando `> 0`      |
| ☐    | Não deve exibir contador quando `= 0`                 |
| ☐    | Título da issue deve possuir link externo para GitHub |

---

## Estado vazio

| Caso | Descrição                                                                   |
| ---- | --------------------------------------------------------------------------- |
| ☐    | Deve exibir `No issues found for this repository.` quando não houver issues |
| ☐    | Não deve exibir paginador quando houver 10 ou menos issues                  |

---

## Parâmetros da URL

| Caso | Descrição                                                |
| ---- | -------------------------------------------------------- |
| ☐    | Deve usar `owner` e `repo` da URL para montar `fullName` |
| ☐    | Deve enviar `page=1` na primeira chamada                 |
| ☐    | Deve enviar `perPage=10`                                 |

---

# Resultado Esperado

Após a implementação:

* Todos os arquivos de teste devem existir
* Todos os cenários listados devem estar cobertos
* Nenhuma requisição real à API deve ocorrer
* Os testes devem executar corretamente com:
