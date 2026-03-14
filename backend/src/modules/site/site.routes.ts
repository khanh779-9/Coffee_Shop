import { Router } from 'express';
import { heroContent } from './site.data';

export const siteRouter = Router();

siteRouter.get('/hero', async (_req, res, next) => {
  try {
    res.json({
      data: heroContent
    });
  } catch (error) {
    next(error);
  }
});
