import { ForbiddenError } from "@shared/_core/errors";
import type { Request, Response } from "express";
import type { User } from "../../drizzle/schema";
import { supabaseAdmin } from "../supabase";
import { ENV } from "./env";

/**
 * Custom Auth Service (replaces Manus OAuth)
 * Uses Supabase for user management
 */

export type AuthenticatedUser = User & {
  taskUid?: string;
  isCron?: boolean;
};

const COOKIE_NAME = "auth_token";

export function getSessionCookieOptions(req: Request) {
  const isSecure = ENV.isProduction;
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: "lax" as const,
    path: "/",
  };
}

/**
 * Extract user ID from request (from cookie or header)
 */
export async function authenticateRequest(
  req: Request,
  res: Response
): Promise<AuthenticatedUser> {
  try {
    // Try to get user ID from cookie or header
    const token = req.cookies[COOKIE_NAME] || req.headers.authorization?.replace("Bearer ", "");
    
    if (!token) {
      throw ForbiddenError("Not authenticated");
    }

    // For now, token is just the user ID (in production, use JWT)
    const userId = parseInt(token, 10);
    if (isNaN(userId)) {
      throw ForbiddenError("Invalid token");
    }

    // Get user from Supabase
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await supabaseAdmin
      .from("users")
      .update({ last_signed_in: new Date().toISOString() })
      .eq("id", userId);

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      passwordHash: user.password_hash,
      role: user.role,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
      lastSignedIn: new Date(user.last_signed_in),
    };
  } catch (error) {
    console.error("[Auth] Authentication failed:", error);
    throw ForbiddenError(error instanceof Error ? error.message : "Authentication failed");
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(res: Response, userId: number, req: Request): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.cookie(COOKIE_NAME, userId.toString(), {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(res: Response, req: Request): void {
  const cookieOptions = getSessionCookieOptions(req);
  res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
}
