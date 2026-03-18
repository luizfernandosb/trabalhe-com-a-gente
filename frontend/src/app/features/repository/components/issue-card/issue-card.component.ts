import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

import { Issue } from '../../../../core/models/repository.model';

function getLabelTextColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(0, 2), 16);
  const g = parseInt(hexColor.slice(2, 4), 16);
  const b = parseInt(hexColor.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

@Component({
  selector: 'app-issue-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './issue-card.component.html',
  styleUrl: './issue-card.component.scss',
})
export class IssueCardComponent {
  @Input({ required: true }) issue!: Issue;

  protected readonly getLabelTextColor = getLabelTextColor;
}
