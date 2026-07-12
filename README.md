# Financial Habit Builder & Wealth Growth Tracker

A full-stack finance tracking app for building savings habits, logging income and expenses, tracking goals, and reviewing wealth growth over time.

## Demo Accounts

- User: `rahul@example.com` / `password123`
- Admin: `admin@fintrack.com` / `admin123`

## Local Setup

1. Install dependencies from the repository root:

```bash
npm install
```

2. Create a `.env` file in `server/` with:

```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_secret
PORT=5000
```

3. Seed the database with demo data:

```bash
npm run seed
```

4. Start both apps in development:

```bash
npm run dev
```

The client runs on Vite and proxies `/api` requests to the backend.

## Production Build

```bash
npm run build
npm start
```

The Express server serves the built client from `client/dist` when it exists.

## Deployment

This repository includes a `render.yaml` file for Render deployment. Set the required environment variables there or in the Render dashboard:

- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV=production`

## Notes

- The backend API lives under `/api`.
- The frontend uses a configurable API base URL and defaults to the same origin in production.
- The admin panel is seeded with a demo admin account and sample financial data.