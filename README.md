# Coffee Shop Monolithic (Angular + TypeScript)

## Structure

- frontend: Angular app cloned from Aroma Coffee UI
- backend: Express API in TypeScript (modular monolith style)
- template_db: SQL schema and seed data
- docker-compose.yml: MySQL + backend + frontend stack

## Env configuration

Both backend and frontend read configuration from their own .env files.

- backend/.env
- frontend/.env

Defaults are already provided in:

- backend/.env.example
- frontend/.env.example

Frontend .env is converted to a browser-safe file automatically before start/build by frontend/scripts/generate-env.cjs.

## Quick start

1. Install dependencies
   - npm install
2. Review env files
   - backend/.env
   - frontend/.env
3. Import database seed into MySQL
   - template_db/coffeeshop_template_db.sql
4. Run backend + frontend locally
   - npm run dev
5. Build all
   - npm run build

## Docker

- Start full stack
  - npm run docker:up
- Stop full stack
  - npm run docker:down

## Services

- Frontend: http://localhost:4200
- Backend API: http://localhost:4000
- MySQL: localhost:3306

## Main API endpoints

- GET /api/health
- POST /api/auth/login
- GET /api/auth/me
- GET /api/site/hero
- GET /api/menu/categories
- GET /api/menu/products
- POST /api/orders
- GET /api/orders
- PATCH /api/orders/:id/status
- GET /api/admin/categories
- POST /api/admin/categories
- PUT /api/admin/categories/:id
- DELETE /api/admin/categories/:id
- GET /api/admin/products
- POST /api/admin/products
- PUT /api/admin/products/:id
- DELETE /api/admin/products/:id
- GET /api/admin/hero
- PUT /api/admin/hero

## Default admin account

- Email: admin@aromacoffee.vn
- Password: Admin@123

## Frontend routes

- /: landing page cloned from Aroma Coffee
- /order: create order and save to MySQL
- /admin/login: admin login
- /admin/orders: view orders and update status
- /admin/content: manage hero, categories, and products
