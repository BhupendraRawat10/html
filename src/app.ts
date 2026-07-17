import express, { Express } from 'express';
import cors from 'cors';
import { apiRoutes } from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export function createApp(): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(apiRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
