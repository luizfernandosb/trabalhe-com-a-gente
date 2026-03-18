// Importa os comandos customizados
import './commands';

// Limpa o localStorage antes de cada teste para isolar o histórico de buscas
beforeEach(() => {
  cy.clearLocalStorage();
});
