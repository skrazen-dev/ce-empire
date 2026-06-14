import type { Express, Request, Response } from "express";
import { setAuthCookie } from "./sdk";

/**
 * OAuth routes (disabled - using Custom Auth instead)
 * Kept for backward compatibility
 */

export function registerOAuthRoutes(app: Express) {
  // OAuth callback endpoint (disabled)
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    res.status(400).json({ error: "OAuth is disabled. Use /api/auth/login instead." });
  });

  // Login endpoint (for Custom Auth)
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: "Username and password required" });
        return;
      }

      // This is handled by tRPC procedure (auth.login)
      // This endpoint is just a placeholder
      res.status(400).json({ error: "Use tRPC auth.login procedure instead" });
    } catch (error) {
      console.error("[Auth] Login failed:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", async (req: Request, res: Response) => {
    try {
      // Clear auth cookie
      res.clearCookie("auth_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      res.json({ success: true });
    } catch (error) {
      console.error("[Auth] Logout failed:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });
}
