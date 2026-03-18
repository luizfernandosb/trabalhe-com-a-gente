import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { env } from '../../config/env.js';

const authHeader = () => ({ Authorization: `Bearer ${env.API_TOKEN}` });

describe('GET /api/health', () => {
  it('deve retornar status 200', async () => {
    const res = await request(app).get('/api/health').set(authHeader());
    expect(res.status).toBe(200);
  });

  it('deve retornar { status: "ok" }', async () => {
    const res = await request(app).get('/api/health').set(authHeader());
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('deve retornar Content-Type json', async () => {
    const res = await request(app).get('/api/health').set(authHeader());
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Rota inexistente', () => {
  it('deve retornar 404 para rotas desconhecidas', async () => {
    const res = await request(app).get('/api/rota-que-nao-existe').set(authHeader());
    expect(res.status).toBe(404);
  });
});
