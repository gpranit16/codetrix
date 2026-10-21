export type LoanStatus = 'PENDING' | 'OVERDUE' | 'REPAID';

export interface User {
  id: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  friendName: string;
  amount: number;
  dueDate: string;
  status: LoanStatus;
  isOverdue: boolean;
  daysOverdue: number;
  repaidAt: string | null;
  receiptUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryData {
  totalLent: number;
  totalRepaid: number;
  overdueAmount: number;
  activeCount: number;
  repaidCount: number;
  overdueCount: number;
}
