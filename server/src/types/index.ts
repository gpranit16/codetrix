import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  phoneNumber: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface LoanSummary {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
  activeCount: number;
  repaidCount: number;
  overdueCount: number;
}
