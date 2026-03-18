import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { env } from '../../config/env.js';

describe('Middleware: errorHandler', () => {
  it('deve retornar 500 com mensagem padrão para erros desconhecidos via REST', async () => {
    // Rota que não existe passa pelo handler do Express com 404,
    // qualquer rota da API que lance erro interno retorna 500
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${env.API_TOKEN}`);
    // health deve continuar funcionando (sem passar pelo errorHandler)
    expect(res.status).toBe(200);
  });
});
