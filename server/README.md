# CE Empire — Server (session auth)

This folder contains a minimal Express + TypeScript server providing session-based authentication
for the CE Empire demo. It stores users in Postgres and uses express-session + connect-pg-simple for
session storage.

Quick start (local development)
1. Install dependencies
   cd server
   npm install

2. Build
   npm run build

3. Prepare Postgres and run migration
   psql $DATABASE_URL -f migrations/001_create_users.sql

4. Seed a demo user (run from the /server folder after build or use ts-node-dev in dev):
   # set SEED_PASSWORD in env before running
   SEED_PASSWORD=YourStrongPass123 npm run dev -- -e "ts-node src/seed-user.ts"
   # or after build:
   SEED_PASSWORD=YourStrongPass123 node dist/seed-user.js

5. Run server
   npm start

Notes
- Do NOT commit real secrets. Use .env files and set environment variables in your deployment.
- In production: enable HTTPS, set secure cookies, and use a strong SESSION_SECRET.
- Add rate limiting / account lockouts for stronger brute-force protection.
