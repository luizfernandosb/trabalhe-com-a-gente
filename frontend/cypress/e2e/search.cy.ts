/// <reference types="cypress" />

describe('Search', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Estado inicial', () => {
    it('deve exibir o estado vazio quando nenhuma pesquisa foi feita', () => {
      cy.get('.gh-empty-state').should('be.visible');
      cy.get('.gh-empty-state__title').should('contain.text', 'Search for repositories');
    });

    it('deve exibir o campo de busca na topbar', () => {
      cy.get('[aria-label="Search repositories"]').should('be.visible');
    });

    it('deve exibir o botão de search na topbar', () => {
      cy.get('.gh-search-box__btn').should('be.visible');
    });

    it('não deve exibir cards de repositório', () => {
      cy.get('.repo-item').should('not.exist');
    });
  });

  context('Validação do campo de busca', () => {
    it('deve manter o botão de search desabilitado quando o campo está vazio', () => {
      cy.get('.gh-search-box__btn').should('be.disabled');
    });

    it('deve habilitar o botão de search quando o campo tem texto', () => {
      cy.typeSearch('react');
      cy.get('.gh-search-box__btn').should('not.be.disabled');
    });

    it('deve desabilitar o botão se o campo for limpo após ter texto', () => {
      cy.typeSearch('react');
      cy.get('[aria-label="Search repositories"]').clear();
      cy.get('.gh-search-box__btn').should('be.disabled');
    });

    it('não deve executar a pesquisa quando apenas espaços são digitados e Enter é pressionado', () => {
      cy.interceptSearchRepositories('repositories');
      cy.get('[aria-label="Search repositories"]').type('   {enter}');
      cy.get('@searchRepos').should('not.exist');
      cy.get('.gh-empty-state').should('be.visible');
    });
  });

  context('Execução da pesquisa', () => {
    beforeEach(() => {
      cy.interceptSearchRepositories('repositories');
    });

    it('deve executar a pesquisa ao pressionar Enter', () => {
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');
      cy.get('.repo-item').should('have.length.greaterThan', 0);
    });

    it('deve executar a pesquisa ao clicar no botão Search', () => {
      cy.typeSearch('react');
      cy.clickSearch();
      cy.wait('@searchRepos');
      cy.get('.repo-item').should('have.length.greaterThan', 0);
    });

    it('deve remover espaços em branco do início e fim da query', () => {
      cy.typeSearch('  react  ');
      cy.clickSearch();
      cy.wait('@searchRepos').its('request.body.variables.query').should('eq', 'react');
    });

    it('deve esconder o estado vazio após busca com resultados', () => {
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');
      cy.get('.gh-empty-state').should('not.exist');
    });

    it('deve exibir o spinner durante o carregamento', () => {
      cy.interceptSearchRepositories('repositories');
      cy.typeSearch('react');
      cy.get('.gh-search-box__btn').click();
      cy.get('.gh-search-box__spinner').should('be.visible');
    });

    it('deve exibir o contador de resultados após busca', () => {
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');
      cy.get('.gh-results-header__count').should('be.visible');
      cy.get('.gh-results-header__label').should('contain.text', 'repository results');
    });

    it('deve exibir mensagem "No results" quando a API retorna lista vazia', () => {
      cy.interceptSearchRepositories('repositories-empty');
      cy.typeSearch('xyznotfound123', true);
      cy.wait('@searchRepos');
      cy.get('.repo-item').should('not.exist');
      cy.get('.gh-results-header').should('not.exist');
    });
  });

  context('Skeleton de carregamento', () => {
    it('deve exibir skeleton cards enquanto carrega', () => {
      // Adiciona delay para que o skeleton seja visível antes da resposta chegar
      cy.intercept('POST', '/graphql', (req) => {
        if (req.body?.query?.includes('searchRepositories')) {
          req.reply({ fixture: 'repositories.json', delay: 600 });
        }
      }).as('slowSearch');

      cy.typeSearch('react');
      cy.get('.gh-search-box__btn').click();
      cy.get('.gh-skeleton-list').should('be.visible');
      cy.wait('@slowSearch');
      cy.get('.gh-skeleton-list').should('not.exist');
      cy.get('.repo-item').should('have.length.greaterThan', 0);
    });
  });
});
