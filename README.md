# Personal Expense Tracker

Live app: https://personal-expense-tracker-client-53iz-o4v1rzjps.vercel.app/

A clean, responsive web app for tracking personal expenses with filtering, sorting, budgeting, and analytics.

## Features
- Add, edit, and delete expenses
- Search and filter by category
- Sort by date, amount, or title
- Budget goal tracking
- PostgreSQL persistence on Neon
- Responsive, polished UI

## Tech Stack
- React + Vite
- Vercel Serverless Functions
- PostgreSQL on Neon

## Run locally
1. Start the backend locally (optional for Vercel preview)
   - cd server
   - npm install
   - npm run dev
2. Start the client
   - cd client
   - npm install
   - npm run dev

## Production notes
This app uses Vercel serverless routes for all expense CRUD operations. The SPA rewrite must not capture `/api/*` requests, or the frontend will silently fall back to the app shell instead of the actual API handler. For delete and update flows, the route should be served by the serverless function at `/api/expenses/:id`.

## Deploy to Vercel
1. Push this repository to GitHub.
2. Create a new Vercel project from the repository.
3. Set the environment variables:
   - DATABASE_URL=your-neon-postgres-connection-string
   - VITE_API_URL=https://personal-expense-tracker-client-53iz-o4v1rzjps.vercel.app/
4. Deploy.
5. Verify the live app can complete these requests:
   - `GET /api/expenses`
   - `POST /api/expenses`
   - `PUT /api/expenses/:id`
   - `PATCH /api/expenses/:id`
   - `DELETE /api/expenses/:id`

## Troubleshooting
- If `DELETE` or `PATCH` fails on the live deployment, check that the request is hitting the API route and not being rewritten to `/index.html`.
- Confirm the frontend is calling the deployed Vercel domain via `VITE_API_URL`, not a local backend URL.
- Confirm the Neon/PostgreSQL connection string is valid and available in the Vercel project environment.
