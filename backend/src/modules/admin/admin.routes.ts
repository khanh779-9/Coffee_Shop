import { Router } from 'express';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { z } from 'zod';
import { pool } from '../../config/db';
import { requireAdmin } from '../../middleware/auth.middleware';

const categorySchema = z.object({
  code: z.string().min(2).max(40),
  name: z.string().min(2).max(80),
  description: z.string().max(255).optional().or(z.literal('')),
  sortOrder: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true)
});

const productSchema = z.object({
  categoryId: z.number().int().positive(),
  name: z.string().min(2).max(120),
  slug: z.string().min(2).max(140),
  description: z.string().max(4000),
  rating: z.number().min(0).max(5),
  priceFrom: z.number().positive(),
  imageUrl: z.string().url().max(600),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true)
});

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get('/categories', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT id, code, name, description, sort_order AS sortOrder, is_active AS isActive FROM categories ORDER BY sort_order ASC, id ASC'
    );
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/categories', async (req, res, next) => {
  try {
    const payload = categorySchema.parse(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO categories (code, name, description, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?)`,
      [payload.code, payload.name, payload.description || null, payload.sortOrder, payload.isActive ? 1 : 0]
    );
    res.status(201).json({ data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/categories/:id', async (req, res, next) => {
  try {
    const payload = categorySchema.parse(req.body);
    await pool.execute(
      `UPDATE categories
       SET code = ?, name = ?, description = ?, sort_order = ?, is_active = ?
       WHERE id = ?`,
      [payload.code, payload.name, payload.description || null, payload.sortOrder, payload.isActive ? 1 : 0, Number(req.params.id)]
    );
    res.json({ data: { id: Number(req.params.id) } });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/categories/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM categories WHERE id = ?', [Number(req.params.id)]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

adminRouter.get('/products', async (_req, res, next) => {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(`
      SELECT
        p.id,
        p.category_id AS categoryId,
        p.name,
        p.slug,
        p.description,
        p.rating,
        p.price_from AS priceFrom,
        p.image_url AS imageUrl,
        p.is_featured AS isFeatured,
        p.is_active AS isActive
      FROM products p
      ORDER BY p.id ASC
    `);
    res.json({ data: rows });
  } catch (error) {
    next(error);
  }
});

adminRouter.post('/products', async (req, res, next) => {
  try {
    const payload = productSchema.parse(req.body);
    const [result] = await pool.execute<ResultSetHeader>(
      `INSERT INTO products (category_id, name, slug, description, rating, price_from, image_url, is_featured, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.categoryId,
        payload.name,
        payload.slug,
        payload.description,
        payload.rating,
        payload.priceFrom,
        payload.imageUrl,
        payload.isFeatured ? 1 : 0,
        payload.isActive ? 1 : 0
      ]
    );
    res.status(201).json({ data: { id: result.insertId } });
  } catch (error) {
    next(error);
  }
});

adminRouter.put('/products/:id', async (req, res, next) => {
  try {
    const payload = productSchema.parse(req.body);
    await pool.execute(
      `UPDATE products
       SET category_id = ?, name = ?, slug = ?, description = ?, rating = ?, price_from = ?, image_url = ?, is_featured = ?, is_active = ?
       WHERE id = ?`,
      [
        payload.categoryId,
        payload.name,
        payload.slug,
        payload.description,
        payload.rating,
        payload.priceFrom,
        payload.imageUrl,
        payload.isFeatured ? 1 : 0,
        payload.isActive ? 1 : 0,
        Number(req.params.id)
      ]
    );
    res.json({ data: { id: Number(req.params.id) } });
  } catch (error) {
    next(error);
  }
});

adminRouter.delete('/products/:id', async (req, res, next) => {
  try {
    await pool.execute('DELETE FROM products WHERE id = ?', [Number(req.params.id)]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});
