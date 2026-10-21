import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';

export interface FormattedLoan {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'OVERDUE' | 'REPAID';
  isOverdue: boolean;
  daysOverdue: number;
  repaidAt: string | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export function formatLoanRecord(loan: {
  id: string;
  userId: string;
  friendName: string;
  amount: Prisma.Decimal;
  dueDate: Date;
  status: string;
  repaidAt: Date | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): FormattedLoan {
  const now = new Date();
  const dueDate = new Date(loan.dueDate);
  const isPastDue = dueDate < now;
  const isOverdue = loan.status === 'PENDING' && isPastDue;

  let daysOverdue = 0;
  if (isOverdue) {
    const diffMs = now.getTime() - dueDate.getTime();
    daysOverdue = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  const effectiveStatus: 'PENDING' | 'OVERDUE' | 'REPAID' =
    loan.status === 'REPAID' ? 'REPAID' : isOverdue ? 'OVERDUE' : 'PENDING';

  return {
    id: loan.id,
    userId: loan.userId,
    friendName: loan.friendName,
    amount: Number(loan.amount),
    dueDate: loan.dueDate.toISOString(),
    status: effectiveStatus,
    isOverdue,
    daysOverdue,
    repaidAt: loan.repaidAt ? loan.repaidAt.toISOString() : null,
    receiptUrl: loan.receiptUrl,
    notes: loan.notes,
    createdAt: loan.createdAt.toISOString(),
    updatedAt: loan.updatedAt.toISOString(),
  };
}

export class LoanService {
  static async createLoan(
    userId: string,
    data: {
      friendName: string;
      amount: number;
      dueDate: string;
      notes?: string;
      receiptUrl?: string;
    }
  ): Promise<FormattedLoan> {
    if (data.amount <= 0) {
      throw new AppError('Loan amount must be strictly positive', 400);
    }

    const loan = await prisma.loan.create({
      data: {
        userId,
        friendName: data.friendName.trim(),
        amount: new Prisma.Decimal(data.amount.toFixed(2)),
        dueDate: new Date(data.dueDate),
        status: 'PENDING',
        notes: data.notes?.trim() || null,
        receiptUrl: data.receiptUrl || null,
      },
    });

    return formatLoanRecord(loan);
  }

  static async getLoans(
    userId: string,
    filter?: { status?: string; search?: string }
  ): Promise<FormattedLoan[]> {
    const where: Prisma.LoanWhereInput = {
      userId,
    };

    if (filter?.search) {
      where.friendName = {
        contains: filter.search.trim(),
        mode: 'insensitive',
      };
    }

    const loans = await prisma.loan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = loans.map(formatLoanRecord);

    if (filter?.status && filter.status !== 'ALL') {
      return formatted.filter((l) => l.status === filter.status);
    }

    return formatted;
  }

  static async getLoanById(userId: string, loanId: string): Promise<FormattedLoan> {
    const loan = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!loan) {
      throw new AppError('Loan entry not found or access denied', 404);
    }

    return formatLoanRecord(loan);
  }

  static async repayLoan(userId: string, loanId: string): Promise<FormattedLoan> {
    const existing = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!existing) {
      throw new AppError('Loan entry not found or access denied', 404);
    }

    if (existing.status === 'REPAID') {
      throw new AppError('This loan has already been marked as repaid.', 400);
    }

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'REPAID',
        repaidAt: new Date(),
      },
    });

    return formatLoanRecord(updated);
  }

  static async attachReceipt(
    userId: string,
    loanId: string,
    receiptUrl: string
  ): Promise<FormattedLoan> {
    const existing = await prisma.loan.findFirst({
      where: { id: loanId, userId },
    });

    if (!existing) {
      throw new AppError('Loan entry not found or access denied', 404);
    }

    const updated = await prisma.loan.update({
      where: { id: loanId },
      data: { receiptUrl },
    });

    return formatLoanRecord(updated);
  }
}
