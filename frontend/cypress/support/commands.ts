/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Intercepta a query GraphQL searchRepositories e responde com o fixture fornecido.
       * @param fixture - nome do arquivo de fixture (sem extensão)
       * @param alias  - alias para o intercept (padrão: 'searchRepos')
       */
      interceptSearchRepositories(fixture: string, alias?: string): Chainable<void>;

      /**
       * Intercepta a query GraphQL searchIssues e responde com o fixture fornecido.
       * @param fixture - nome do arquivo de fixture (sem extensão)
       * @param alias  - alias para o intercept (padrão: 'searchIssues')
       */
      interceptSearchIssues(fixture: string, alias?: string): Chainable<void>;

      /**
       * Digita no campo de busca da topbar e opcionalmente confirma com Enter.
       */
      typeSearch(text: string, confirm?: boolean): Chainable<void>;

      /**
       * Clica no botão Search da topbar.
       */
      clickSearch(): Chainable<void>;
    }
  }
}

Cypress.Commands.add(
  'interceptSearchRepositories',
  (fixture: string, alias = 'searchRepos') => {
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body?.query?.includes('searchRepositories')) {
        req.reply({ fixture: `${fixture}.json` });
      }
    }).as(alias);
  },
);

Cypress.Commands.add(
  'interceptSearchIssues',
  (fixture: string, alias = 'searchIssues') => {
    cy.intercept('POST', '/graphql', (req) => {
      if (req.body?.query?.includes('searchIssues')) {
        req.reply({ fixture: `${fixture}.json` });
      }
    }).as(alias);
  },
);

Cypress.Commands.add('typeSearch', (text: string, confirm = false) => {
  cy.get('[aria-label="Search repositories"]').clear().type(text);
  if (confirm) {
    cy.get('[aria-label="Search repositories"]').type('{enter}');
  }
});

Cypress.Commands.add('clickSearch', () => {
  cy.get('.gh-search-box__btn').click();
});

export {};
