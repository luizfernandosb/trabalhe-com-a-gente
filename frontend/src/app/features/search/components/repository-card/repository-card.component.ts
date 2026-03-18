import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';

import { Repository } from '../../../../core/models/repository.model';

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  Ruby: '#701516',
  PHP: '#4F5D95',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Dart: '#00B4AB',
  'C++': '#f34b7d',
  'C#': '#178600',
  C: '#555555',
  Vue: '#41b883',
  Svelte: '#ff3e00',
};

@Component({
  selector: 'app-repository-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './repository-card.component.html',
  styleUrl: './repository-card.component.scss',
})
export class RepositoryCardComponent {
  @Input({ required: true }) repository!: Repository;

  private readonly router = inject(Router);

  protected getLanguageColor(language: string | null): string {
    if (!language) return '#8b949e';
    return LANGUAGE_COLORS[language] ?? '#8b949e';
  }

  protected formatCount(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1).replace('.0', '') + 'k';
    }
    return count.toString();
  }

  protected openIssues(): void {
    const [owner, repo] = this.repository.full_name.split('/');
    this.router.navigate(['/repository', owner, repo, 'issues']);
  }
}
