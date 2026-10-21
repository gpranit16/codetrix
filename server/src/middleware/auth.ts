import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyToken } from '../utils/jwt';
import { prisma } from '../lib/prisma';
import { AppError } from './errorHandler';

export async function requireAuth(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(
        new AppError('Authentication required. Missing or invalid Bearer token.', 401)
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return next(new AppError('Authentication token missing.', 401));
    }

    const payload = verifyToken(token);

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, phoneNumber: true },
    });

    if (!user) {
      return next(new AppError('User account not found or deleted.', 401));
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
