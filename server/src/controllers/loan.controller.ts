import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { LoanService } from '../services/loan.service';
import { AppError } from '../middleware/errorHandler';

export class LoanController {
  static async createLoan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { friendName, amount, dueDate, notes } = req.body;
      const loan = await LoanService.createLoan(req.user.id, {
        friendName,
        amount,
        dueDate,
        notes,
      });

      res.status(201).json({
        success: true,
        message: 'Loan entry created successfully',
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLoans(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { status, search } = req.query as { status?: string; search?: string };
      const loans = await LoanService.getLoans(req.user.id, { status, search });

      res.status(200).json({
        success: true,
        count: loans.length,
        data: loans,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLoanById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const loan = await LoanService.getLoanById(req.user.id, id);

      res.status(200).json({
        success: true,
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async repayLoan(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const loan = await LoanService.repayLoan(req.user.id, id);

      res.status(200).json({
        success: true,
        message: 'Loan successfully marked as repaid',
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }

  static async uploadReceipt(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      if (!req.file) {
        throw new AppError('No receipt image file uploaded', 400);
      }

      // Construct public URL for receipt
      const receiptUrl = `/uploads/${req.file.filename}`;
      const loan = await LoanService.attachReceipt(req.user.id, id, receiptUrl);

      res.status(200).json({
        success: true,
        message: 'Receipt uploaded successfully',
        data: loan,
      });
    } catch (error) {
      next(error);
    }
  }
}
