import { searchRepositories, searchIssues } from '../../services/github.service.js';

const rootResolver = { searchRepositories, searchIssues };

export { rootResolver };
