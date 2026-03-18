import { Routes } from '@angular/router';

import { SearchPageComponent } from './features/search/pages/search-page/search-page.component';

export const routes: Routes = [
	{
		path: '',
		component: SearchPageComponent,
	},
	{
		path: 'repository/:owner/:repo/issues',
		loadComponent: () =>
			import('./features/repository/pages/issues-page/issues-page.component').then(
				(m) => m.IssuesPageComponent,
			),
	},
];
