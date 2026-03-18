import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../../app.js';
import { env } from '../../config/env.js';

describe('Middleware: authMiddleware', () => {
  it('deve retornar 401 quando o header Authorization está ausente', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/ausente/i);
    expect(res.body.statusCode).toBe(401);
  });

  it('deve retornar 401 quando o esquema não é Bearer', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Basic ${env.API_TOKEN}`);
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/ausente/i);
  });

  it('deve retornar 401 quando o token é incorreto', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', 'Bearer token-invalido-qualquer');
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/inválido/i);
    expect(res.body.statusCode).toBe(401);
  });

  it('deve retornar 401 quando o token está vazio após Bearer', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', 'Bearer ');
    expect(res.status).toBe(401);
  });

  it('deve liberar o acesso quando o token é válido', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Authorization', `Bearer ${env.API_TOKEN}`);
    expect(res.status).toBe(200);
  });

  it('deve bloquear também requisições GraphQL sem token', async () => {
    const res = await request(app)
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send({ query: '{ __typename }' });
    expect(res.status).toBe(401);
  });
});
