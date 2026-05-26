import "dotenv/config";

import express from "express";
import passport from "passport";
import cors from "cors";
import session from "express-session";
import helmet from "helmet";

import authRouter from "./routes/auth.ts";
import apiRouter from "./routes/api.ts";

import AuthMiddleware from "./middleware/auth.ts";

const corsOptions: cors.CorsOptions = {
  origin: [`${process.env.CLIENT_HOST}`],
  credentials: true,
};
const sessionOptions: session.SessionOptions = {
  secret: `${process.env.SESSION_SECRET}`,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  },
};

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
app.use("/auth", authRouter);
app.use("/api", AuthMiddleware.ensureAuth, apiRouter);
app.use("/logout", AuthMiddleware.ensureAuth, AuthMiddleware.handleLogout);

app.get("*splat", (_req, res) => {
  res.status(401).send("Unauthorized");
});

export default app;
