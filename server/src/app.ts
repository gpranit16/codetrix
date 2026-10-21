import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth.routes';
import loanRoutes from './routes/loan.routes';
import summaryRoutes from './routes/summary.routes';
import healthRoutes from './routes/health.routes';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';

export const app: Express = express();

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static uploaded receipts
const uploadPath = path.resolve(process.cwd(), env.UPLOAD_DIR);
app.use('/uploads', express.static(uploadPath));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/summary', summaryRoutes);

// Root informational endpoint
app.get('/', (_req: Request, res: Response) => {
  res.json({
    name: 'MiniLedger API',
    version: '1.0.0',
    status: 'online',
    docs: '/api/health',
    endpoints: {
      auth: ['POST /api/auth/send-otp', 'POST /api/auth/verify-otp', 'GET /api/auth/me'],
      loans: [
        'GET /api/loans',
        'POST /api/loans',
        'GET /api/loans/:id',
        'PATCH /api/loans/:id/repay',
        'POST /api/loans/:id/receipt',
      ],
      summary: ['GET /api/summary'],
      health: ['GET /api/health'],
    },
  });
});

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);
