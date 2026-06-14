import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { supabaseAdmin } from "../supabase";

/**
 * Tasks Router
 * Provides endpoints for task management (CRUD, status updates, assignments)
 */

export const tasksRouter = {
  /**
   * Get active tasks for current user (for MegaDashboard)
   */
  getMyActiveTasks: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("tasks")
        .select("*")
        .eq("user_id", ctx.user.id)
        .neq("status", "done")
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;

      return (data || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.due_date,
        createdAt: task.created_at,
      }));
    } catch (error) {
      console.error("[Tasks] Failed to get active tasks:", error);
      return [];
    }
  }),

  /**
   * Complete task (for MegaDashboard)
   */
  completeTask: protectedProcedure
    .input(z.object({ taskId: z.union([z.string(), z.number()]) }))
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from("tasks")
          .update({ status: "done", updated_at: new Date().toISOString() })
          .eq("id", input.taskId)
          .eq("user_id", ctx.user.id)
          .select()
          .single();

        if (error) throw error;

        return {
          id: data.id,
          title: data.title,
          status: data.status,
        };
      } catch (error) {
        console.error("[Tasks] Failed to complete task:", error);
        throw error;
      }
    }),

  /**
   * Get all projects for current user
   */
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    try {
      const { data, error } = await supabaseAdmin
        .from("projects")
        .select("*")
        .eq("user_id", ctx.user.id);

      if (error) throw error;

      return (data || []).map((p: any) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        color: p.color,
      }));
    } catch (error) {
      console.error("[Tasks] Failed to get projects:", error);
      throw error;
    }
  }),

  /**
   * Get tasks for a project
   */
  getProjectTasks: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      try {
        const { data: projectTasks, error } = await supabaseAdmin
          .from("tasks")
          .select("*")
          .eq("project_id", input.projectId)
          .eq("user_id", ctx.user.id);

        if (error) throw error;

        // Group by status
        const grouped = {
          todo: (projectTasks || []).filter((t: any) => t.status === "todo"),
          in_progress: (projectTasks || []).filter((t: any) => t.status === "in_progress"),
          done: (projectTasks || []).filter((t: any) => t.status === "done"),
        };

        return {
          todo: grouped.todo.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
          })),
          in_progress: grouped.in_progress.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
          })),
          done: grouped.done.map((t: any) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            status: t.status,
            priority: t.priority,
            dueDate: t.due_date,
          })),
        };
      } catch (error) {
        console.error("[Tasks] Failed to get project tasks:", error);
        throw error;
      }
    }),

  /**
   * Create new task
   */
  createTask: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        dueDate: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { data, error } = await supabaseAdmin
          .from("tasks")
          .insert({
            project_id: input.projectId,
            user_id: ctx.user.id,
            title: input.title,
            description: input.description,
            priority: input.priority,
            due_date: input.dueDate,
            status: "todo",
            created_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (error) throw error;

        return data;
      } catch (error) {
        console.error("[Tasks] Failed to create task:", error);
        throw error;
      }
    }),

  /**
   * Update task status
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["todo", "in_progress", "done"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("tasks")
          .update({
            status: input.status,
            updated_at: new Date().toISOString(),
          })
          .eq("id", input.taskId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Tasks] Failed to update task status:", error);
        throw error;
      }
    }),

  /**
   * Delete task
   */
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const { error } = await supabaseAdmin
          .from("tasks")
          .delete()
          .eq("id", input.taskId);

        if (error) throw error;

        return { success: true };
      } catch (error) {
        console.error("[Tasks] Failed to delete task:", error);
        throw error;
      }
    }),
};
