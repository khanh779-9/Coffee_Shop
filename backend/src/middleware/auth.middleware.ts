import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  sub: number;
  email: string;
  role: 'admin' | 'staff' | 'customer';
  fullName: string;
}

const parseToken = (token: string): TokenPayload => {
  const decoded = jwt.verify(token, env.jwtSecret);

  if (typeof decoded === 'string' || !decoded.sub || !decoded.email || !decoded.role || !decoded.fullName) {
    throw new Error('Invalid token payload');
  }

  return {
    sub: Number(decoded.sub),
    email: String(decoded.email),
    role: decoded.role as TokenPayload['role'],
    fullName: String(decoded.fullName)
  };
};

export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    next();
    return;
  }

  try {
    const payload = parseToken(header.slice(7));
    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName
    };
  } catch {
    req.authUser = undefined;
  }

  next();
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const payload = parseToken(header.slice(7));
    if (payload.role !== 'admin' && payload.role !== 'staff') {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    req.authUser = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      fullName: payload.fullName
    };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
