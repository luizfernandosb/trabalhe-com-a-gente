/// <reference types="cypress" />

describe('Repository Card', () => {
  beforeEach(() => {
    cy.interceptSearchRepositories('repositories');
    cy.visit('/');
    cy.typeSearch('react', true);
    cy.wait('@searchRepos');
  });

  context('Exibição dos dados', () => {
    it('deve exibir o nome completo do repositório (full_name)', () => {
      cy.get('.repo-item').first().find('.repo-item__name').should('contain.text', 'facebook/react');
    });

    it('deve exibir o avatar do owner', () => {
      cy.get('.repo-item').first().find('.repo-item__avatar')
        .should('be.visible')
        .and('have.attr', 'src')
        .and('include', 'avatars.githubusercontent.com');
    });

    it('deve exibir o badge "Public"', () => {
      cy.get('.repo-item').first().find('.repo-item__badge').should('contain.text', 'Public');
    });

    it('deve exibir a descrição do repositório', () => {
      cy.get('.repo-item').first().find('.repo-item__description')
        .should('contain.text', 'The library for web and native user interfaces.');
    });

    it('deve exibir a linguagem do repositório', () => {
      cy.get('.repo-item').first().find('.repo-item__lang').should('contain.text', 'JavaScript');
    });

    it('deve exibir o ponto colorido da linguagem', () => {
      cy.get('.repo-item').first().find('.repo-item__lang-dot').should('be.visible');
    });

    it('deve exibir a contagem de estrelas formatada', () => {
      // 230000 => 230k
      cy.get('.repo-item').first().find('.repo-item__stars').should('contain.text', '230k');
    });

    it('deve exibir os topics do repositório', () => {
      cy.get('.repo-item').first().find('.repo-item__topic')
        .should('have.length.greaterThan', 0);
    });

    it('deve exibir no máximo 5 topics por card', () => {
      cy.get('.repo-item').first().find('.repo-item__topic').should('have.length.at.most', 5);
    });

    it('deve exibir a data de última atualização', () => {
      cy.get('.repo-item').first().find('.repo-item__date').should('be.visible');
    });

    it('deve exibir o link externo para o GitHub', () => {
      cy.get('.repo-item').first().find('.repo-item__gh-link')
        .should('have.attr', 'href', 'https://github.com/facebook/react')
        .and('have.attr', 'target', '_blank');
    });
  });

  context('Comportamento de clique', () => {
    it('deve navegar para a página de issues ao clicar no card', () => {
      cy.interceptSearchIssues('issues');
      cy.get('.repo-item').first().click();
      cy.url().should('include', '/repository/facebook/react/issues');
    });

    it('o link externo não deve navegar para a página de issues', () => {
      // Previne abertura de nova aba, apenas verifica que stopPropagation funciona
      cy.get('.repo-item').first().find('.repo-item__gh-link').then(($link) => {
        $link[0].addEventListener('click', (e) => e.preventDefault());
      });
      cy.get('.repo-item').first().find('.repo-item__gh-link').click();
      cy.url().should('eq', `${Cypress.config('baseUrl')}/`);
    });
  });

  context('Múltiplos repositórios', () => {
    it('deve renderizar múltiplos cards', () => {
      cy.get('.repo-item').should('have.length', 3);
    });

    it('cada card deve exibir um repositório diferente', () => {
      cy.get('.repo-item__name').then(($names) => {
        const names = [...$names].map((el) => el.textContent?.trim());
        const unique = new Set(names);
        expect(unique.size).to.eq(names.length);
      });
    });
  });
});
