## Projeto

Construir uma aplicação **SPA (Single Page Application)** utilizando **Angular v21** (versão mais recente até o momento) e também desenvolver um **backend**.

A aplicação deverá permitir que o usuário **pesquise repositórios no GitHub** e exiba **informações relevantes de cada repositório de forma paginada**.

A arquitetura deve ser organizada, escalável e seguir boas práticas modernas de desenvolvimento.

---

# Regras

## Frontend

O frontend deverá:

* Permitir pesquisar repositórios por **nome**
* Listar informações relevantes como:

  * nome
  * URL
  * descrição
  * contagem de watchers
  * estrelas
  * issues
  * linguagem
  * última atualização
* Implementar **paginação via API**
* Seguir boas práticas de **UX/UI**
* Utilizar **componentização adequada**
* Utilizar **RxJS para controle de requisições e fluxo assíncrono**

---

## Backend

O backend deverá:

* Servir como **camada intermediária entre o frontend e a API do GitHub**
* Disponibilizar **endpoints GraphQL**
* Implementar **tratamento de erros**
* Implementar **caching**
* Seguir boas práticas de arquitetura
* Utilizar estrutura de pastas organizada

---

# Stack

## Frontend

* Angular v21
* Angular Material
* RxJS
* Cypress (testes end-to-end)

## Backend

* Node.js
* Express
* GraphQL
* Node Cache ou Redis para caching

---

# Arquitetura do Frontend

A aplicação Angular deverá seguir uma arquitetura modular.

Estrutura sugerida:

```
src/
  app/
    core/
      services/
      interceptors/
      models/
    shared/
      components/
      pipes/
      directives/
    features/
      search/
        components/
        services/
        pages/
        models/
    layout/
      components/
```

### Descrição das camadas

**core**

Serviços globais da aplicação:

* comunicação com backend
* interceptors HTTP
* models globais

**shared**

Componentes reutilizáveis:

* cards
* loaders
* botões
* pipes

**features**

Cada funcionalidade da aplicação.

Neste projeto teremos:

```
search
```

---

# Regras de Interface (Frontend)

O frontend deverá conter:

* Uma **barra de pesquisa ocupando toda largura da tela**
* Um **ícone de lupa dentro da barra de pesquisa**

O sistema deverá:

* Salvar **histórico de pesquisas do usuário**
* Executar **pesquisa em tempo real enquanto o usuário digita**

Exemplo:

Se o usuário digitar:

```
rea
```

O sistema deverá:

* exibir uma lista abaixo com resultados da API
* cada item deverá ser clicável
* ao clicar, o sistema executa a busca completa

A busca completa será executada quando:

* o usuário clicar em um item da lista
* o usuário pressionar **ENTER**

---

# Regras do Campo de Pesquisa

* remover espaços em branco no início e no fim da pesquisa
* se o campo estiver vazio e o usuário pressionar ENTER, **nada deve acontecer**
* utilizar **debounceTime do RxJS para evitar excesso de requisições**
* utilizar **distinctUntilChanged**

---

# Exibição dos Resultados

Os resultados deverão ser exibidos em **cards**.

Cada card deverá conter:

* organização ou usuário / nome do repositório (`full_name`)
* ícone da organização ou usuário
* descrição
* topics
* linguagem (`language`)
* estrelas (`stargazers_count`)
* última atualização (`updated_at`)

Formato da data:

Exemplos:

```
Updated on 13 de fev
Updated 1 hour ago
Updated on 20 de jun. de 2024
```

---

# Paginação

A lista deverá exibir:

```
10 itens por página
```

A API do GitHub possui o parâmetro:

```
per_page
```

Esse parâmetro deverá ser utilizado para limitar os resultados.

---

# Filtros

Criar um select chamado:

```
Sort by:
```

Opções:

* stars
* forks
* help-wanted-issues
* updated

Criar outro select:

```
Order by:
```

Opções:

* desc
* asc

---

# Cores do Projeto

Utilizar as cores:

Menu bar:

```
#010409
```

Corpo do site:

```
#0D1117
```

Borda dos cards:

```
#FFFFFF
```

Fundo dos cards:

```
transparente
```

---

# Backend

O backend deverá consumir a **API pública do GitHub** e expor dados via **GraphQL**.

O backend não deve expor diretamente a API do GitHub para o frontend.

---

# Arquitetura do Backend

Estrutura sugerida:

```
src/
  config/
  controllers/
  services/
  graphql/
    schema/
    resolvers/
  cache/
  middlewares/
  utils/
  routes/
```

### controllers

Controlam requisições HTTP.

### services

Contêm regras de negócio e chamadas para APIs externas.

### graphql

Definição do schema e resolvers.

### cache

Camada de caching.

---

# GraphQL

O backend deverá expor uma query semelhante a:

```
searchRepositories
```

Exemplo de parâmetros:

```
query
page
perPage
sort
order
```

Exemplo de retorno:

```
repositories
totalCount
currentPage
totalPages
```

---

# Caching

Implementar caching para reduzir chamadas repetidas à API do GitHub.

Estratégias possíveis:

* Node Cache
* Redis

A chave de cache deverá considerar:

```
query
page
sort
order
```

O tempo de cache pode ser aproximadamente:

```
60 segundos
```

---

# Variáveis de Ambiente

Criar um arquivo:

```
.env
```

Exemplo:

```
GITHUB_API_KEY=
PORT=3000
```

A API Key será utilizada para autenticar requisições na API do GitHub.

---

# Tratamento de Erros

O backend deverá:

* tratar erros da API do GitHub
* retornar mensagens claras para o frontend
* evitar expor erros internos

Formato padrão de erro:

```
{
  message: string,
  statusCode: number
}
```

---

# Tipagem dos Repositórios

Estrutura esperada:

```
Repository
  id
  full_name
  description
  html_url
  language
  stargazers_count
  watchers_count
  topics
  updated_at
  owner
```

Owner:

```
Owner
  login
  avatar_url
```

---

# Boas Práticas

Sempre:

* escrever código limpo
* evitar duplicação
* utilizar tipagem forte
* separar responsabilidades
* escrever componentes reutilizáveis
* manter funções pequenas e claras
* tratar erros adequadamente

---

# Testes

Utilizar **Cypress** para testes end-to-end.

Testar:

* pesquisa
* paginação
* filtros
* ordenação
* exibição dos cards
* histórico de pesquisa
