import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../../config/db';
import { env } from '../../config/env';
import { requireAdmin } from '../../middleware/auth.middleware';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

export const authRouter = Router();

authRouter.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [payload.email]
    );

    const user = (rows as Array<{
      id: number;
      full_name: string;
      email: string;
      password_hash: string;
      role: 'admin' | 'staff' | 'customer';
    }>)[0];

    if (!user || (user.role !== 'admin' && user.role !== 'staff')) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    const isValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isValid) {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
      return;
    }

    const token = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name
      },
      env.jwtSecret,
      { expiresIn: '8h' }
    );

    res.json({
      data: {
        token,
        user: {
          id: user.id,
          fullName: user.full_name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', requireAdmin, async (req, res) => {
  res.json({ data: req.authUser });
});
