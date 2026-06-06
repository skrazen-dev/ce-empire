import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Plus, Trash2, Edit2 } from "lucide-react";

interface KanbanBoardProps {
  projectId: number;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ projectId }) => {
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const { data: tasks, isLoading } = trpc.tasks.getTasksByProject.useQuery(
    { projectId },
    { enabled: !!projectId }
  );

  const updateStatusMutation = trpc.tasks.updateTaskStatus.useMutation();
  const deleteTaskMutation = trpc.tasks.deleteTask.useMutation();
  const createTaskMutation = trpc.tasks.createTask.useMutation();

  const handleDragStart = (e: React.DragEvent, taskId: number, status: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("taskId", taskId.toString());
    e.dataTransfer.setData("fromStatus", status);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent, toStatus: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("taskId"));
    const fromStatus = e.dataTransfer.getData("fromStatus");

    if (fromStatus !== toStatus) {
      await updateStatusMutation.mutateAsync({
        taskId,
        status: toStatus as "todo" | "in_progress" | "done",
      });
    }
  };

  if (isLoading) return <div className="text-center py-8">Loading...</div>;

  const columns = [
    { key: "todo", label: "To Do", color: "#00d4ff" },
    { key: "in_progress", label: "In Progress", color: "#ffd700" },
    { key: "done", label: "Done", color: "#10b981" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {columns.map((column) => (
        <div key={column.key} className="flex flex-col">
          {/* Column Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: column.color }}
              />
              <h3 className="text-sm font-semibold text-white">{column.label}</h3>
              <span className="text-xs text-gray-400">
                {tasks?.[column.key as keyof typeof tasks]?.length || 0}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                // Open create task modal
              }}
              className="h-6 w-6 p-0"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Droppable Area */}
          <div
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.key)}
            className="flex-1 space-y-3 p-4 rounded-lg border border-[#2a3142] bg-[#1a1f2e] min-h-[500px] transition-colors hover:border-[#00d4ff]/30"
          >
            {tasks?.[column.key as keyof typeof tasks]?.map((task: any) => (
              <Card
                key={task.id}
                draggable
                onDragStart={(e) => handleDragStart(e, task.id, column.key)}
                onClick={() => setSelectedTask(task.id)}
                className="p-4 cursor-move hover:border-[#00d4ff] transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-white line-clamp-2">
                      {task.title}
                    </h4>
                    {task.description && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-3">
                      {task.priority && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            task.priority === "urgent"
                              ? "bg-red-500/20 text-red-300"
                              : task.priority === "high"
                              ? "bg-orange-500/20 text-orange-300"
                              : task.priority === "medium"
                              ? "bg-yellow-500/20 text-yellow-300"
                              : "bg-green-500/20 text-green-300"
                          }`}
                        >
                          {task.priority}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-gray-400">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedTask(task.id);
                      }}
                      className="p-1 hover:bg-[#2a3142] rounded"
                    >
                      <Edit2 className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTaskMutation.mutate({ taskId: task.id });
                      }}
                      className="p-1 hover:bg-red-500/20 rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
