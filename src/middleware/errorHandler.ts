import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/AppError';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}


export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }


  // console.error('[unhandled error]', err);
  res.status(500).json({ error: 'Internal server error' });
}
