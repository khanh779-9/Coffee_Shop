import cors from 'cors';
import express from 'express';
import { ZodError } from 'zod';
import { env } from './config/env';
import { adminRouter } from './modules/admin/admin.routes';
import { authRouter } from './modules/auth/auth.routes';
import { menuRouter } from './modules/menu/menu.routes';
import { ordersRouter } from './modules/orders/orders.routes';
import { siteRouter } from './modules/site/site.routes';

export const app = express();

// Allow CORS for all origins and credentials (for development)
app.use(cors({
  origin: (_origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'aroma-coffee-api' });
});

app.use('/api/auth', authRouter);
app.use('/api/admin', adminRouter);
app.use('/api/menu', menuRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/site', siteRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      message: 'Dữ liệu gửi lên không hợp lệ',
      errors: error.issues
    });
    return;
  }

  if (error instanceof Error) {
    res.status(500).json({ message: error.message });
    return;
  }

  res.status(500).json({ message: 'Internal server error' });
});
