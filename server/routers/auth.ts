import { z } from "zod";
import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { registerUser, loginUser, verifyPassword } from "../auth";
import { supabaseAdmin } from "../supabase";

export const authRouter = {
  /**
   * Register a new user
   */
  register: publicProcedure
    .input(
      z.object({
        username: z
          .string()
          .min(3, "Username must be at least 3 characters")
          .max(50, "Username must be at most 50 characters")
          .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscore, and dash"),
        email: z.string().email("Invalid email"),
        password: z
          .string()
          .min(6, "Password must be at least 6 characters")
          .max(100, "Password must be at most 100 characters"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await registerUser(input.username, input.email, input.password);
      
      if (!result.success) {
        throw new Error(result.error || "Registration failed");
      }

      return {
        success: true,
        userId: result.userId,
        user: {
          id: result.userId,
          username: input.username,
          email: input.email,
          role: "user",
        },
      };
    }),

  /**
   * Login with username and password
   */
  login: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "Username required"),
        password: z.string().min(1, "Password required"),
      })
    )
    .mutation(async ({ input }) => {
      const result = await loginUser(input.username, input.password);
      
      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      return {
        success: true,
        user: {
          id: result.userId,
          username: result.username,
          role: result.role,
        },
      };
    }),

  /**
   * Get current user info
   */
  me: protectedProcedure.query(async ({ ctx }) => {
    return {
      id: ctx.user.id,
      username: ctx.user.username,
      role: ctx.user.role,
    };
  }),

  /**
   * Logout (server-side session cleanup)
   */
  logout: protectedProcedure.mutation(async () => {
    return { success: true };
  }),

  /**
   * Change password
   */
  changePassword: protectedProcedure
    .input(
      z.object({
        currentPassword: z.string().min(1, "Current password required"),
        newPassword: z
          .string()
          .min(6, "New password must be at least 6 characters")
          .max(100, "New password must be at most 100 characters"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Get current user
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("id", ctx.user.id)
          .single();

        if (error || !user) {
          throw new Error("User not found");
        }

        // Verify current password
        const isValid = await verifyPassword(input.currentPassword, user.password_hash);
        if (!isValid) {
          throw new Error("Current password is incorrect");
        }

        // Hash new password
        const { hashPassword } = await import("../auth");
        const newPasswordHash = await hashPassword(input.newPassword);

        // Update password
        const { error: updateError } = await supabaseAdmin
          .from("users")
          .update({
            password_hash: newPasswordHash,
            updated_at: new Date().toISOString(),
          })
          .eq("id", ctx.user.id);

        if (updateError) {
          throw new Error("Failed to update password");
        }

        return { success: true };
      } catch (error) {
        console.error("[Auth] Change password failed:", error);
        throw new Error(error instanceof Error ? error.message : "Change password failed");
      }
    }),
};
