import { AppError } from '../utils/app-error.js';

const errorHandler = (error, _req, res, _next) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  return res.status(500).json({
    message: 'Erro interno do servidor.',
    statusCode: 500,
  });
};

export { errorHandler };
