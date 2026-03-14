import dotenv from 'dotenv';

dotenv.config();

const toNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  port: toNumber(process.env.PORT, 4000),
  dbHost: process.env.DB_HOST ?? '127.0.0.1',
  dbPort: toNumber(process.env.DB_PORT, 3306),
  dbUser: process.env.DB_USER ?? 'root',
  dbPassword: process.env.DB_PASSWORD ?? '',
  dbName: process.env.DB_NAME ?? 'coffeeshop_template_db',
  jwtSecret: process.env.JWT_SECRET ?? 'change-this-secret',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:4200'
};
