/// <reference types="cypress" />

describe('Issues Page', () => {
  const visitIssuesPage = (fixture = 'issues') => {
    cy.interceptSearchIssues(fixture);
    cy.visit('/repository/facebook/react/issues');
    cy.wait('@searchIssues');
  };

  context('Breadcrumb e cabeçalho', () => {
    beforeEach(() => visitIssuesPage());

    it('deve exibir o breadcrumb com "Repositories"', () => {
      cy.get('.issues-page__breadcrumb').should('contain.text', 'Repositories');
    });

    it('deve exibir o nome do repositório no breadcrumb', () => {
      cy.get('.issues-page__breadcrumb').should('contain.text', 'facebook/react');
    });

    it('deve exibir "Issues" como item atual no breadcrumb', () => {
      cy.get('.issues-page__breadcrumb-current').should('contain.text', 'Issues');
    });

    it('deve ter o link "Repositories" apontando para a raiz', () => {
      cy.get('.issues-page__breadcrumb-link').first().should('have.attr', 'href', '/');
    });

    it('deve navegar de volta para a página inicial ao clicar em "Repositories"', () => {
      cy.get('.issues-page__breadcrumb-link').first().click();
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    });
  });

  context('Loading spinner', () => {
    it('deve exibir o spinner enquanto carrega as issues', () => {
      cy.interceptSearchIssues('issues');
      cy.visit('/repository/facebook/react/issues');
      cy.get('.issues-loading__spinner').should('be.visible');
      cy.wait('@searchIssues');
      cy.get('.issues-loading__spinner').should('not.exist');
    });
  });

  context('Exibição das issues', () => {
    beforeEach(() => visitIssuesPage());

    it('deve exibir a contagem de issues abertas no cabeçalho', () => {
      cy.get('.issues-box__toggle-active').should('contain.text', '2');
      cy.get('.issues-box__toggle-active').should('contain.text', 'Open');
    });

    it('deve renderizar a lista de issues', () => {
      cy.get('.issue-row').should('have.length', 2);
    });

    it('deve exibir o título da issue', () => {
      cy.get('.issue-row').first().find('.issue-row__title')
        .should('contain.text', 'Fix memory leak in useEffect cleanup');
    });

    it('deve exibir o número da issue', () => {
      cy.get('.issue-row').first().find('.issue-row__meta').should('contain.text', '#28456');
    });

    it('deve exibir o autor da issue', () => {
      cy.get('.issue-row').first().find('.issue-row__author').should('contain.text', 'dev-user');
    });

    it('deve exibir as labels da issue', () => {
      cy.get('.issue-row').first().find('.issue-row__label').should('have.length', 2);
      cy.get('.issue-row').first().find('.issue-row__label').eq(0).should('contain.text', 'bug');
      cy.get('.issue-row').first().find('.issue-row__label').eq(1).should('contain.text', 'good first issue');
    });

    it('deve exibir o ícone verde para issue aberta', () => {
      // fill está no próprio <svg>, não em descendente — seletor sem espaço
      cy.get('.issue-row').first().find('.issue-row__icon svg[fill="#3fb950"]').should('exist');
    });

    it('deve exibir o ícone roxo para issue fechada', () => {
      cy.get('.issue-row').eq(1).find('.issue-row__icon svg[fill="#8957e5"]').should('exist');
    });

    it('deve exibir a data de abertura da issue', () => {
      cy.get('.issue-row').first().find('.issue-row__meta').should('contain.text', 'Opened');
    });

    it('deve exibir a data de fechamento para issues fechadas', () => {
      cy.get('.issue-row').eq(1).find('.issue-row__meta').should('contain.text', 'Closed');
    });

    it('deve exibir o contador de comentários quando > 0', () => {
      // primeira issue tem 14 comentários
      cy.get('.issue-row').first().find('.issue-row__comments').should('contain.text', '14');
    });

    it('não deve exibir o contador de comentários quando = 0', () => {
      // segunda issue tem 0 comentários
      cy.get('.issue-row').eq(1).find('.issue-row__comments').should('not.exist');
    });

    it('o título da issue deve ter link para o GitHub', () => {
      cy.get('.issue-row').first().find('.issue-row__title')
        .should('have.attr', 'href', 'https://github.com/facebook/react/issues/28456')
        .and('have.attr', 'target', '_blank');
    });
  });

  context('Estado vazio', () => {
    it('deve exibir mensagem quando não há issues', () => {
      visitIssuesPage('issues-empty');
      cy.get('.issues-box__empty').should('be.visible');
      cy.get('.issues-box__empty').should('contain.text', 'No issues found for this repository.');
    });

    it('não deve exibir paginador quando há 10 ou menos issues', () => {
      visitIssuesPage();
      cy.get('mat-paginator').should('not.exist');
    });
  });

  context('Parâmetros da URL', () => {
    it('deve usar owner e repo da URL para montar o fullName na query', () => {
      cy.interceptSearchIssues('issues');
      cy.visit('/repository/angular/angular/issues');
      cy.wait('@searchIssues')
        .its('request.body.variables.fullName')
        .should('eq', 'angular/angular');
    });

    it('deve usar page=1 na primeira chamada', () => {
      cy.interceptSearchIssues('issues');
      cy.visit('/repository/facebook/react/issues');
      cy.wait('@searchIssues').its('request.body.variables.page').should('eq', 1);
    });

    it('deve usar perPage=10', () => {
      cy.interceptSearchIssues('issues');
      cy.visit('/repository/facebook/react/issues');
      cy.wait('@searchIssues').its('request.body.variables.perPage').should('eq', 10);
    });
  });
});
