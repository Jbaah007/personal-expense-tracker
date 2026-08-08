# Personal Expense Tracker

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

## Deploy to Vercel
1. Push this repository to GitHub.
2. Create a new Vercel project from the repository.
3. Set the environment variables:
   - DATABASE_URL=your-neon-postgres-connection-string
   - VITE_API_URL=https://your-vercel-app-name.vercel.app
4. Deploy.
