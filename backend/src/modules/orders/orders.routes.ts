import { Router } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../../config/db';
import { optionalAuth, requireAdmin } from '../../middleware/auth.middleware';

const createOrderSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerPhone: z.string().min(8).max(20),
  customerAddress: z.string().max(255).optional().or(z.literal('')),
  note: z.string().max(255).optional().or(z.literal('')),
  items: z.array(z.object({
    productId: z.number().int().positive(),
    quantity: z.number().int().positive().max(20)
  })).min(1)
});

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'])
});

const orderIdSchema = z.coerce.number().int().positive();

export const ordersRouter = Router();

ordersRouter.post('/', optionalAuth, async (req, res, next) => {
  const connection = await pool.getConnection();
  let hasTransaction = false;

  try {
    const payload = createOrderSchema.parse(req.body);
    const productIds = payload.items.map((item) => item.productId);
    const placeholders = productIds.map(() => '?').join(', ');

    const [productRows] = await connection.query<RowDataPacket[]>(
      `SELECT id, name, price_from FROM products WHERE id IN (${placeholders}) AND is_active = 1`,
      productIds
    );

    if (productRows.length !== productIds.length) {
      res.status(400).json({ message: 'Có sản phẩm không hợp lệ trong đơn hàng' });
      return;
    }

    const productMap = new Map(productRows.map((row) => [Number(row.id), row]));
    const totalAmount = payload.items.reduce((sum, item) => {
      const product = productMap.get(item.productId);
      return sum + Number(product?.price_from ?? 0) * item.quantity;
    }, 0);

    await connection.beginTransaction();
    hasTransaction = true;

    const [orderResult] = await connection.execute<ResultSetHeader>(
      `INSERT INTO orders (user_id, customer_name, customer_phone, customer_address, note, status, total_amount)
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [
        req.authUser?.id ?? null,
        payload.customerName,
        payload.customerPhone,
        payload.customerAddress || null,
        payload.note || null,
        totalAmount
      ]
    );

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      await connection.execute(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [orderResult.insertId, item.productId, item.quantity, Number(product?.price_from ?? 0)]
      );
    }

    await connection.commit();

    res.status(201).json({
      data: {
        id: orderResult.insertId,
        totalAmount,
        status: 'pending'
      }
    });
  } catch (error) {
    if (hasTransaction) {
      await connection.rollback();
    }
    next(error);
  } finally {
    connection.release();
  }
});

ordersRouter.get('/', requireAdmin, async (_req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        o.id,
        o.customer_name AS customerName,
        o.customer_phone AS customerPhone,
        o.customer_address AS customerAddress,
        o.note,
        o.status,
        o.total_amount AS totalAmount,
        o.created_at AS createdAt,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'productName', p.name,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price,
            'lineTotal', oi.line_total
          )
        ) AS items
      FROM orders o
      JOIN order_items oi ON oi.order_id = o.id
      JOIN products p ON p.id = oi.product_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

ordersRouter.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try {
    const orderId = orderIdSchema.parse(req.params.id);
    const payload = updateStatusSchema.parse(req.body);
    const [result] = await pool.execute<ResultSetHeader>('UPDATE orders SET status = ? WHERE id = ?', [
      payload.status,
      orderId
    ]);

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
      return;
    }

    res.json({ data: { id: orderId, status: payload.status } });
  } catch (error) {
    next(error);
  }
});
