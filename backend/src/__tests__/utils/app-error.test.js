import { describe, it, expect } from 'vitest';
import { AppError } from '../../utils/app-error.js';

describe('AppError', () => {
  it('deve criar um erro com mensagem e statusCode padrão 500', () => {
    const error = new AppError('Algo deu errado.');
    expect(error.message).toBe('Algo deu errado.');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('deve criar um erro com statusCode customizado', () => {
    const error = new AppError('Não encontrado.', 404);
    expect(error.message).toBe('Não encontrado.');
    expect(error.statusCode).toBe(404);
  });

  it('deve criar um erro 502 para erros de gateway', () => {
    const error = new AppError('Bad Gateway', 502);
    expect(error.statusCode).toBe(502);
  });

  it('deve ser reconhecido pelo instanceof AppError', () => {
    const error = new AppError('Teste');
    expect(error instanceof AppError).toBe(true);
  });

  it('deve ter stack trace definido', () => {
    const error = new AppError('Com stack');
    expect(error.stack).toBeDefined();
  });
});
