import "dotenv/config";

import express from "express";
import passport from "passport";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import { fileURLToPath } from "url";

import authRouter from "./routes/auth.ts";
import apiRouter from "./routes/api.ts";

import AuthMiddleware from "./middleware/auth.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
app.use(session(sessionOptions));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// API Routes
app.use("/auth", authRouter);
app.use("/api", AuthMiddleware.ensureAuth, apiRouter);
app.use("/logout", AuthMiddleware.ensureAuth, AuthMiddleware.handleLogout);

// Serve React static files in production
if (process.env.NODE_ENV === "production") {
  const distPath = path.join(__dirname, "../../admin/dist");
  app.use(express.static(distPath));

  // SPA catch-all route - serve index.html for all non-API routes
  app.use(async (req, res) => {
    // Protect admin UI - only serve to authenticated admin users
    if (!req.path.startsWith("/api") && !req.path.startsWith("/auth") && !req.path.startsWith("/logout")) {
      if (!req.isAuthenticated()) {
        return res.status(401).send("Authentication required");
      }

      const userId = (req.user as any)?.id;
      if (!userId) {
        return res.status(401).send("Invalid user session");
      }

      const AdminService = (await import("./services/admin.ts")).default;
      const adminService = new AdminService();
      const isAdminResult = await adminService.isAdmin(userId);

      if (!isAdminResult.ok || !isAdminResult.value) {
        return res.status(403).send("Admin access required");
      }

      res.sendFile(path.join(distPath, "index.html"));
    }
  });
} else {
  // In development, return 401 for non-API routes
  app.use((req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/auth") && !req.path.startsWith("/logout")) {
      res.status(401).send("Unauthorized - Use 'npm run admin:dev' for frontend development");
    }
  });
}

export default app;
