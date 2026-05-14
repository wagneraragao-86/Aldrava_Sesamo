import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger.js';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
}

export function errorHandler(error: unknown, req: Request, res: Response, _next: NextFunction) {
  logger.error({ error, path: req.path }, 'Unhandled request error');
  res.status(500).json({ message: 'Internal server error' });
}
