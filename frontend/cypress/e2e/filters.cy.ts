/// <reference types="cypress" />

describe('Filters and Sorting', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  context('Presença dos filtros', () => {
    it('deve exibir o select de Sort na topbar', () => {
      cy.get('.topbar__filters').should('be.visible');
      cy.get('.gh-filter__select').should('have.length', 2);
    });

    it('deve exibir as opções corretas no select Sort', () => {
      cy.get('.gh-filter__select').eq(0).find('option').then(($opts) => {
        const values = [...$opts].map((o) => o.getAttribute('value'));
        expect(values).to.include.members(['stars', 'forks', 'help-wanted-issues', 'updated']);
      });
    });

    it('deve exibir as opções corretas no select Order', () => {
      cy.get('.gh-filter__select').eq(1).find('option').then(($opts) => {
        const values = [...$opts].map((o) => o.getAttribute('value'));
        expect(values).to.include.members(['desc', 'asc']);
      });
    });

    it('deve ter "stars" como valor padrão do Sort', () => {
      cy.get('.gh-filter__select').eq(0).should('have.value', 'stars');
    });

    it('deve ter "desc" como valor padrão do Order', () => {
      cy.get('.gh-filter__select').eq(1).should('have.value', 'desc');
    });
  });

  context('Comportamento dos filtros', () => {
    it('deve enviar o parâmetro sort correto na query GraphQL', () => {
      cy.interceptSearchRepositories('repositories');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos').its('request.body.variables.sort').should('eq', 'stars');
    });

    it('deve enviar o parâmetro order correto na query GraphQL', () => {
      cy.interceptSearchRepositories('repositories');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos').its('request.body.variables.order').should('eq', 'desc');
    });

    it('deve disparar nova busca ao alterar o Sort após pesquisa', () => {
      cy.interceptSearchRepositories('repositories');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');

      cy.interceptSearchRepositories('repositories', 'sortChanged');
      cy.get('.gh-filter__select').eq(0).select('forks');
      cy.wait('@sortChanged').its('request.body.variables.sort').should('eq', 'forks');
    });

    it('deve disparar nova busca ao alterar o Order após pesquisa', () => {
      cy.interceptSearchRepositories('repositories');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');

      cy.interceptSearchRepositories('repositories', 'orderChanged');
      cy.get('.gh-filter__select').eq(1).select('asc');
      cy.wait('@orderChanged').its('request.body.variables.order').should('eq', 'asc');
    });

    it('deve enviar sort "updated" corretamente', () => {
      cy.interceptSearchRepositories('repositories');
      cy.get('.gh-filter__select').eq(0).select('updated');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos').its('request.body.variables.sort').should('eq', 'updated');
    });

    it('deve enviar sort "help-wanted-issues" corretamente', () => {
      cy.interceptSearchRepositories('repositories');
      cy.get('.gh-filter__select').eq(0).select('help-wanted-issues');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos').its('request.body.variables.sort').should('eq', 'help-wanted-issues');
    });

    it('deve reiniciar para página 1 ao alterar filtro', () => {
      cy.interceptSearchRepositories('repositories-page2');
      cy.typeSearch('react', true);
      cy.wait('@searchRepos');

      cy.interceptSearchRepositories('repositories', 'filterReset');
      cy.get('.gh-filter__select').eq(0).select('forks');
      cy.wait('@filterReset').its('request.body.variables.page').should('eq', 1);
    });
  });
});
