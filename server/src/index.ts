import { app } from './app';
import { env } from './config/env';
import { logger } from './utils/logger';
import { prisma } from './lib/prisma';

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    logger.info('Connected to PostgreSQL successfully.');

    app.listen(env.PORT, '0.0.0.0', () => {
      logger.info(`MiniLedger Server running on http://localhost:${env.PORT}`);
      logger.info(`LAN Access: http://192.168.1.103:${env.PORT}`);
      logger.info(`Android Emulator Access: http://10.0.2.2:${env.PORT}`);
      logger.info(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
