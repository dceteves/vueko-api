import 'dotenv/config';

import express from 'express';
import passport from 'passport';
import cors from 'cors';
import session from 'express-session';
import helmet from 'helmet';

import authRoutes from './src/routes/auth.ts';
import apiRoutes from './src/routes/api.ts';

import AuthMiddleware from './src/middleware/auth.ts';

const corsOptions: cors.CorsOptions = {
  origin: [`${process.env.CLIENT_HOST}`],
  credentials: true,
};
const sessionOptions: session.SessionOptions = {
  secret: `${process.env.SESSION_SECRET}`,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
};

const port = process.env.PORT || 3000;
const app = express();

// Global middleware
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
app.use(session(sessionOptions));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api', AuthMiddleware.ensureAuth, apiRoutes);
app.use('/logout', AuthMiddleware.ensureAuth, AuthMiddleware.handleLogout);

app.get('*splat', (_req, res) => {
  res.status(401).send('Unauthorized');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
  console.log('Available URLs:');
  console.log(`http://localhost:${port}`);
});
