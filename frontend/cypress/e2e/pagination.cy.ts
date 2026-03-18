/// <reference types="cypress" />

describe('Pagination', () => {
  beforeEach(() => {
    cy.interceptSearchRepositories('repositories');
    cy.visit('/');
    cy.typeSearch('react', true);
    cy.wait('@searchRepos');
  });

  context('Exibição do paginador', () => {
    it('deve exibir o paginador quando há resultados', () => {
      cy.get('mat-paginator').should('be.visible');
    });

    it('deve exibir o total de resultados no paginador', () => {
      // fixture tem totalCount = 125
      cy.get('mat-paginator').should('contain.text', '125');
    });

    it('não deve exibir o seletor de itens por página', () => {
      cy.get('.mat-mdc-paginator-page-size').should('not.exist');
    });
  });

  context('Navegação entre páginas', () => {
    it('deve navegar para a próxima página ao clicar em "Next page"', () => {
      cy.interceptSearchRepositories('repositories-page2', 'page2');

      cy.get('[aria-label="Next page"]').click();
      cy.wait('@page2').its('request.body.variables.page').should('eq', 2);

      cy.get('.repo-item').first().find('.repo-item__name').should('contain.text', 'svelte/svelte');
    });

    it('deve enviar perPage=10 na query GraphQL', () => {
      cy.get('@searchRepos').its('request.body.variables.perPage').should('eq', 10);
    });

    it('deve resetar para página 1 ao realizar nova busca', () => {
      cy.interceptSearchRepositories('repositories-page2', 'page2');
      cy.get('[aria-label="Next page"]').click();
      cy.wait('@page2');

      cy.interceptSearchRepositories('repositories', 'newSearch');
      cy.typeSearch('angular', true);
      cy.wait('@newSearch').its('request.body.variables.page').should('eq', 1);
    });

    it('deve desabilitar o botão "Previous page" na primeira página', () => {
      // Angular Material MDC define disabled via atributo disabled ou aria-disabled
      cy.get('.mat-mdc-paginator-navigation-previous').then(($btn) => {
        const isDisabled =
          $btn.attr('disabled') !== undefined ||
          $btn.attr('aria-disabled') === 'true' ||
          ($btn[0] as HTMLButtonElement).disabled === true;
        expect(isDisabled).to.be.true;
      });
    });

    it('deve habilitar o botão "Previous page" após ir para a página 2', () => {
      cy.interceptSearchRepositories('repositories-page2', 'page2');
      cy.get('[aria-label="Next page"]').click();
      cy.wait('@page2');

      cy.get('.mat-mdc-paginator-navigation-previous')
        .should('not.have.attr', 'aria-disabled', 'true')
        .and('not.have.attr', 'disabled');
    });

    it('deve voltar para a página 1 ao clicar em "Previous page"', () => {
      cy.interceptSearchRepositories('repositories-page2', 'page2');
      cy.get('[aria-label="Next page"]').click();
      cy.wait('@page2');

      cy.interceptSearchRepositories('repositories', 'backToPage1');
      cy.get('.mat-mdc-paginator-navigation-previous').click();
      cy.wait('@backToPage1').its('request.body.variables.page').should('eq', 1);
    });
  });
});
