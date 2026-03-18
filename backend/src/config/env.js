import dotenv from 'dotenv';

dotenv.config();

const env = {
  PORT: Number(process.env.PORT || 3000),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GITHUB_API_KEY: process.env.GITHUB_API_KEY || '',
  CACHE_TTL_SECONDS: Number(process.env.CACHE_TTL_SECONDS || 60),
  API_TOKEN: process.env.API_TOKEN || '',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:4200',
};

export { env };
