import { prisma } from '../lib/prisma';
import { LoanSummary } from '../types';

export class SummaryService {
  static async getSummary(userId: string): Promise<LoanSummary> {
    const now = new Date();

    // Fetch all user's loans with exact Decimal amount, status and dueDate
    const loans = await prisma.loan.findMany({
      where: { userId },
      select: {
        amount: true,
        status: true,
        dueDate: true,
      },
    });

    let totalLentCents = 0;
    let totalRepaidCents = 0;
    let overdueAmountCents = 0;

    let activeCount = 0;
    let repaidCount = 0;
    let overdueCount = 0;

    for (const loan of loans) {
      // Convert to cents (integer) for exact decimal arithmetic
      const amountCents = Math.round(Number(loan.amount) * 100);
      totalLentCents += amountCents;

      if (loan.status === 'REPAID') {
        totalRepaidCents += amountCents;
        repaidCount++;
      } else {
        // Pending loan
        activeCount++;
        const isPastDue = new Date(loan.dueDate) < now;
        if (isPastDue) {
          overdueAmountCents += amountCents;
          overdueCount++;
        }
      }
    }

    return {
      totalLent: totalLentCents / 100,
      totalRepaid: totalRepaidCents / 100,
      overdueAmount: overdueAmountCents / 100,
      activeCount,
      repaidCount,
      overdueCount,
    };
  }
}
