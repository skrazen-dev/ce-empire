import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { teamMembers, users } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Team Router
 * Provides endpoints for team member management
 */

export const teamRouter = {
  /**
   * Get all team members for a project
   */
  getTeamMembers: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const members = await db
        .select()
        .from(teamMembers)
        .where(
          and(
            eq(teamMembers.projectId, input.projectId),
            eq(teamMembers.userId, ctx.user.id)
          )
        );

      // Fetch user details for each member
      const memberDetails = await Promise.all(
        members.map(async (m) => {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.id, m.memberId))
            .then((rows) => rows[0]);

          return {
            id: m.id,
            memberId: m.memberId,
            name: user?.name || "Unknown",
            email: user?.email || "",
            role: m.role,
            joinedAt: m.joinedAt,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`,
          };
        })
      );

      return memberDetails;
    }),

  /**
   * Add team member to project
   */
  addTeamMember: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        memberId: z.number(),
        role: z.enum(["owner", "lead", "member", "viewer"]).default("member"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(teamMembers).values({
        userId: ctx.user.id,
        projectId: input.projectId,
        memberId: input.memberId,
        role: input.role,
      });

      return { success: true };
    }),

  /**
   * Update team member role
   */
  updateTeamMemberRole: protectedProcedure
    .input(
      z.object({
        teamMemberId: z.number(),
        role: z.enum(["owner", "lead", "member", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(teamMembers)
        .set({ role: input.role })
        .where(
          and(
            eq(teamMembers.id, input.teamMemberId),
            eq(teamMembers.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Remove team member from project
   */
  removeTeamMember: protectedProcedure
    .input(z.object({ teamMemberId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(teamMembers)
        .where(
          and(
            eq(teamMembers.id, input.teamMemberId),
            eq(teamMembers.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
};
