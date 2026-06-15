import express from 'express';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './auth';
import { pool } from './db';

dotenv.config();

const app = express();
const PgSession = connectPgSimple(session as any);

app.use(express.json());

app.set('trust proxy', process.env.NODE_ENV === 'production');

app.use(session({
  store: new PgSession({ pool }),
  name: process.env.SESSION_COOKIE_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/api', authRoutes);

// Serve static demo site
app.use(express.static(path.join(process.cwd(), 'dist')));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`CE Empire server listening on ${port}`));
