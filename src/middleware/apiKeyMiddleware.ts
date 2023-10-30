import { NextFunction, Request, Response } from 'express';
import { apiKey } from '../config/config';

export const apiKeyMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization || req.headers.authorization !== apiKey) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  // If the API key is correct, continue to the next middleware or route handler
  next();
};
