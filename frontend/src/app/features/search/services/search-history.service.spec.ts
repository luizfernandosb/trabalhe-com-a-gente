import { TestBed } from '@angular/core/testing';
import { SearchHistoryService } from './search-history.service';

const HISTORY_KEY = 'github-repo-search-history';

describe('SearchHistoryService', () => {
  let service: SearchHistoryService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(SearchHistoryService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getHistory()', () => {
    it('deve retornar array vazio quando não há histórico', () => {
      expect(service.getHistory()).toEqual([]);
    });

    it('deve retornar o histórico salvo', () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(['react', 'angular']));
      expect(service.getHistory()).toEqual(['react', 'angular']);
    });

    it('deve retornar array vazio quando o JSON é inválido', () => {
      localStorage.setItem(HISTORY_KEY, '{invalid json}');
      expect(service.getHistory()).toEqual([]);
    });

    it('deve retornar array vazio quando o valor não é um array', () => {
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ not: 'array' }));
      expect(service.getHistory()).toEqual([]);
    });
  });

  describe('save()', () => {
    it('deve salvar um novo termo no início da lista', () => {
      service.save('react');
      expect(service.getHistory()[0]).toBe('react');
    });

    it('deve mover um termo existente para o início', () => {
      service.save('angular');
      service.save('react');
      service.save('angular');
      const history = service.getHistory();
      expect(history[0]).toBe('angular');
      expect(history.filter((h) => h === 'angular').length).toBe(1);
    });

    it('não deve salvar termos com espaços em branco', () => {
      service.save('   ');
      expect(service.getHistory()).toEqual([]);
    });

    it('não deve salvar string vazia', () => {
      service.save('');
      expect(service.getHistory()).toEqual([]);
    });

    it('deve manter no máximo 8 itens', () => {
      for (let i = 1; i <= 10; i++) {
        service.save(`term${i}`);
      }
      expect(service.getHistory().length).toBe(8);
    });

    it('deve manter os 8 mais recentes', () => {
      for (let i = 1; i <= 10; i++) {
        service.save(`term${i}`);
      }
      const history = service.getHistory();
      expect(history[0]).toBe('term10');
      expect(history[7]).toBe('term3');
    });
  });
});
