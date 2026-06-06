import { protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tasks, projects, taskAssignments } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Tasks Router
 * Provides endpoints for task management (CRUD, status updates, assignments)
 */

export const tasksRouter = {
  /**
   * Get all projects for current user
   */
  getProjects: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const userProjects = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, ctx.user.id));

    return userProjects.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      status: p.status,
      color: p.color,
      displayOrder: p.displayOrder,
      createdAt: p.createdAt,
    }));
  }),

  /**
   * Get all tasks for a project (grouped by status)
   */
  getTasksByProject: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const projectTasks = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.projectId, input.projectId), eq(tasks.userId, ctx.user.id)));

      // Group by status
      const grouped = {
        todo: projectTasks.filter((t) => t.status === "todo"),
        in_progress: projectTasks.filter((t) => t.status === "in_progress"),
        done: projectTasks.filter((t) => t.status === "done"),
      };

      return {
        todo: grouped.todo.map((t) => formatTask(t)),
        in_progress: grouped.in_progress.map((t) => formatTask(t)),
        done: grouped.done.map((t) => formatTask(t)),
      };
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
        priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
        dueDate: z.date().optional(),
        assignedTo: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db.insert(tasks).values({
        projectId: input.projectId,
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        priority: input.priority,
        dueDate: input.dueDate,
        assignedTo: input.assignedTo,
        status: "todo",
        displayOrder: 0,
      });

      return { id: result[0] };
    }),

  /**
   * Update task status (for Kanban drag-drop)
   */
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        status: z.enum(["todo", "in_progress", "done"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(tasks)
        .set({ status: input.status })
        .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Update task details
   */
  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
        dueDate: z.date().optional(),
        assignedTo: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const updates: any = {};
      if (input.title !== undefined) updates.title = input.title;
      if (input.description !== undefined) updates.description = input.description;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.dueDate !== undefined) updates.dueDate = input.dueDate;
      if (input.assignedTo !== undefined) updates.assignedTo = input.assignedTo;

      await db
        .update(tasks)
        .set(updates)
        .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Delete task
   */
  deleteTask: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .delete(tasks)
        .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Get task detail with assignments
   */
  getTaskDetail: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const task = await db
        .select()
        .from(tasks)
        .where(and(eq(tasks.id, input.taskId), eq(tasks.userId, ctx.user.id)))
        .then((rows) => rows[0]);

      if (!task) throw new Error("Task not found");

      const assignments = await db
        .select()
        .from(taskAssignments)
        .where(eq(taskAssignments.taskId, input.taskId));

      return {
        ...formatTask(task),
        assignments: assignments.map((a) => ({
          id: a.id,
          assignedToUserId: a.assignedToUserId,
          assignedByUserId: a.assignedByUserId,
          assignedAt: a.assignedAt,
          completedAt: a.completedAt,
        })),
      };
    }),
};

// Helper function to format task
function formatTask(task: typeof tasks.$inferSelect) {
  return {
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    dueDate: task.dueDate,
    assignedTo: task.assignedTo,
    displayOrder: task.displayOrder,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
