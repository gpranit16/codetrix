import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { SummaryService } from '../services/summary.service';
import { AppError } from '../middleware/errorHandler';

export class SummaryController {
  static async getSummary(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const summary = await SummaryService.getSummary(req.user.id);

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}
