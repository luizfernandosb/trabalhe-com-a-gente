import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock env before importing cache
vi.mock('../../config/env.js', () => ({
  env: { CACHE_TTL_SECONDS: 60 },
}));

import { cache } from '../../cache/node-cache.js';

describe('cache (node-cache)', () => {
  beforeEach(() => {
    cache.flushAll();
  });

  afterEach(() => {
    cache.flushAll();
  });

  it('deve armazenar e recuperar um valor pelo key', () => {
    cache.set('key1', { data: 'test' });
    expect(cache.get('key1')).toEqual({ data: 'test' });
  });

  it('deve retornar undefined para uma chave inexistente', () => {
    expect(cache.get('nao-existe')).toBeUndefined();
  });

  it('deve sobrescrever o valor ao setar a mesma chave', () => {
    cache.set('key1', 'first');
    cache.set('key1', 'second');
    expect(cache.get('key1')).toBe('second');
  });

  it('deve deletar uma chave existente', () => {
    cache.set('key1', 'value');
    cache.del('key1');
    expect(cache.get('key1')).toBeUndefined();
  });

  it('deve limpar todo o cache com flushAll', () => {
    cache.set('a', 1);
    cache.set('b', 2);
    cache.set('c', 3);
    cache.flushAll();
    expect(cache.get('a')).toBeUndefined();
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get('c')).toBeUndefined();
  });

  it('deve armazenar valores de tipos diferentes', () => {
    cache.set('string', 'hello');
    cache.set('number', 42);
    cache.set('array', [1, 2, 3]);
    cache.set('object', { nested: { value: true } });

    expect(cache.get('string')).toBe('hello');
    expect(cache.get('number')).toBe(42);
    expect(cache.get('array')).toEqual([1, 2, 3]);
    expect(cache.get('object')).toEqual({ nested: { value: true } });
  });

  it('deve verificar se uma chave existe com has()', () => {
    cache.set('exists', true);
    expect(cache.has('exists')).toBe(true);
    expect(cache.has('not-exists')).toBe(false);
  });

  it('deve retornar o número de chaves com keys()', () => {
    cache.flushAll();
    cache.set('x', 1);
    cache.set('y', 2);
    expect(cache.keys().length).toBe(2);
  });
});
