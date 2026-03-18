// @ts-check
/**
 * Script que lê as variáveis do arquivo .env e gera src/environments/environment.ts.
 * Execute antes de iniciar ou buildar o projeto:
 *   node scripts/set-env.js
 */

const { writeFileSync, existsSync } = require('fs');
const { resolve } = require('path');
const dotenv = require('dotenv');

const envPath = resolve(__dirname, '../.env');

if (!existsSync(envPath)) {
  console.warn('[set-env] Arquivo .env não encontrado. Copie .env.example para .env e preencha as variáveis.');
  console.warn('[set-env] Continuando com variáveis de ambiente do processo...');
}

dotenv.config({ path: envPath });

const apiToken = process.env.API_TOKEN ?? '';

if (!apiToken) {
  console.warn('[set-env] AVISO: API_TOKEN não definido. As requisições ao backend serão rejeitadas.');
}

const content = `// ARQUIVO GERADO AUTOMATICAMENTE por scripts/set-env.js
// NÃO edite manualmente. Altere o .env e rode: node scripts/set-env.js
export const environment = {
  apiToken: '${apiToken}',
};
`;

const outputPath = resolve(__dirname, '../src/environments/environment.ts');
writeFileSync(outputPath, content, 'utf8');

console.log('[set-env] src/environments/environment.ts gerado com sucesso.');
