import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { supabaseAdmin } from "../supabase";

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
      try {
        const { data, error } = await supabaseAdmin
          .from("team_members")
          .select("*")
          .eq("project_id", input.projectId)
          .eq("user_id", ctx.user.id);

        if (error) throw error;

        // Fetch user details for each member
        const memberDetails = await Promise.all(
          (data || []).map(async (m: any) => {
            const { data: user } = await supabaseAdmin
              .from("users")
              .select("*")
              .eq("id", m.member_id)
              .single();

            return {
              id: m.id,
              memberId: m.member_id,
              name: user?.username || "Unknown",
              email: user?.email || "",
              role: m.role,
              joinedAt: m.joined_at,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`,
            };
          })
        );

        return memberDetails;
      } catch (error) {
        console.error("[Team] Failed to get team members:", error);
        throw error;
      }
    }),

  /**
   * Add a team member
   */
  addTeamMember: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        memberId: z.number(),
        role: z.enum(["viewer", "editor", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("team_members")
          .insert({
            project_id: input.projectId,
            user_id: ctx.user.id,
            member_id: input.memberId,
            role: input.role,
            joined_at: new Date().toISOString(),
          });

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Team] Failed to add team member:", error);
        throw error;
      }
    }),

  /**
   * Remove a team member
   */
  removeTeamMember: protectedProcedure
    .input(z.object({ teamMemberId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("team_members")
          .delete()
          .eq("id", input.teamMemberId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Team] Failed to remove team member:", error);
        throw error;
      }
    }),
};
