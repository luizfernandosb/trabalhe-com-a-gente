import NodeCache from 'node-cache';
import { env } from '../config/env.js';

const cache = new NodeCache({ stdTTL: env.CACHE_TTL_SECONDS, checkperiod: 30 });

export { cache };
