import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthenticatedUser } from '../types';

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      phoneNumber: user.phoneNumber,
    },
    env.JWT_SECRET,
    {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    }
  );
}

export function verifyToken(token: string): AuthenticatedUser {
  const decoded = jwt.verify(token, env.JWT_SECRET) as {
    id: string;
    phoneNumber: string;
  };
  return {
    id: decoded.id,
    phoneNumber: decoded.phoneNumber,
  };
}
