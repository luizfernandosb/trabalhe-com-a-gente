import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.js'],
      exclude: ['src/index.js', 'src/**/__tests__/**'],
    },
    // Isola o cache entre testes
    clearMocks: true,
    restoreMocks: true,
    // Garante uma única instância de 'graphql' em todo o ambiente de testes,
    // evitando o erro "Cannot use GraphQLSchema from another module or realm"
    // que ocorre quando graphql-http e o schema usam instâncias distintas.
    server: {
      deps: {
        inline: ['graphql'],
      },
    },
  },
});
