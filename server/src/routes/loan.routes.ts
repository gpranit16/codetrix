import { Router } from 'express';
import { LoanController } from '../controllers/loan.controller';
import { requireAuth } from '../middleware/auth';
import { validateBody, validateParams } from '../middleware/validate';
import { createLoanSchema, loanIdParamSchema } from '../validators';
import { uploadReceiptMiddleware } from '../config/multer';

const router = Router();

// Protect all loan routes
router.use(requireAuth);

// GET /api/loans - list loans
router.get('/', LoanController.getLoans);

// POST /api/loans - create loan
router.post('/', validateBody(createLoanSchema), LoanController.createLoan);

// GET /api/loans/:id - get single loan
router.get('/:id', validateParams(loanIdParamSchema), LoanController.getLoanById);

// PATCH /api/loans/:id/repay - mark loan as repaid
router.patch('/:id/repay', validateParams(loanIdParamSchema), LoanController.repayLoan);

// POST /api/loans/:id/receipt - upload receipt image
router.post(
  '/:id/receipt',
  validateParams(loanIdParamSchema),
  uploadReceiptMiddleware.single('receipt'),
  LoanController.uploadReceipt
);

export default router;
