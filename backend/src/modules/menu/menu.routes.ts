import { Router } from 'express';
import { RowDataPacket } from 'mysql2';
import { pool } from '../../config/db';

export const menuRouter = Router();

menuRouter.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT code, name FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC'
    );

    res.json({
      data: [
        { code: 'all', name: 'Tất cả' },
        ...rows.map((row) => ({
          code: String(row.code),
          name: String(row.name)
        }))
      ]
    });
  } catch (error) {
    next(error);
  }
});

menuRouter.get('/products', async (req, res, next) => {
  try {
    const category = String(req.query.category ?? 'all');
    const params: Array<string> = [];
    const filterClause = category === 'all' ? '' : 'AND c.code = ?';
    if (category !== 'all') {
      params.push(category);
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT
         p.id,
         p.name,
         p.rating,
         p.price_from AS priceFrom,
         p.image_url AS imageUrl,
         p.description,
         c.code AS categoryCode,
         c.name AS categoryLabel
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND c.is_active = 1 ${filterClause}
       ORDER BY c.sort_order ASC, p.id ASC`,
      params
    );

    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});
