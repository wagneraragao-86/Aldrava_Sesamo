import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { JwtUser } from '@aldrava/shared';
import { env } from '../config/env.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}

export function signToken(user: JwtUser) {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(user, env.JWT_SECRET, options);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    return res.status(401).json({ message: 'Missing bearer token' });
  }

  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as JwtUser;
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
