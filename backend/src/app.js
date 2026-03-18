import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createHandler } from 'graphql-http/lib/use/express';
import { schema } from './graphql/schema/index.js';
import { rootResolver } from './graphql/resolvers/index.js';
import { authMiddleware } from './middlewares/auth.middleware.js';
import { errorHandler } from './middlewares/error-handler.js';
import { AppError } from './utils/app-error.js';
import { router } from './routes/index.js';
import { env } from './config/env.js';

const app = express();

// Security headers
app.use(helmet());

// CORS — only allow configured origin
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));

// Rate limiting — max 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again later.', statusCode: 429 },
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(authMiddleware);

app.use('/api', router);

app.all(
  '/graphql',
  createHandler({
    schema,
    rootValue: rootResolver,
    formatError: (error) => {
      const original = error.originalError;
      if (original instanceof AppError) {
        return {
          message: original.message,
          statusCode: original.statusCode,
        };
      }

      return {
        message: 'Falha na execução da query GraphQL.',
        statusCode: 500,
      };
    },
  }),
);

app.use(errorHandler);

export { app };
