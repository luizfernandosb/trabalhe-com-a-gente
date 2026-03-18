import { Injectable } from '@angular/core';

const HISTORY_KEY = 'github-repo-search-history';

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  getHistory(): string[] {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  save(term: string): void {
    const value = term.trim();
    if (!value) return;

    const current = this.getHistory().filter((item) => item !== value);
    const updated = [value, ...current].slice(0, 8);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  }
}
