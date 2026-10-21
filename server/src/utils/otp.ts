import crypto from 'crypto';
import bcrypt from 'bcrypt';

export function generateSixDigitOtp(): string {
  return crypto.randomInt(100000, 1000000).toString();
}

export async function hashOtp(otp: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

export async function verifyOtpHash(otp: string, hashedOtp: string): Promise<boolean> {
  return bcrypt.compare(otp, hashedOtp);
}
