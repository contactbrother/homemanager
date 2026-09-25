"use client";

import { useOptimistic, useState } from "react";
import { TaskHistory } from "./task-history";
import { AddNote } from "./add-note";
import type { TaskMessageWithAuthor } from "@/features/tasks/types";

/**
 * FR-041. A note appears in the history the moment it is sent, and is removed if the
 * server refuses. The client never waits on the network to see their own words.
 */
export function TaskThread({
  taskId,
  entries,
  audience,
  authorName,
  label,
}: {
  taskId: string;
  entries: TaskMessageWithAuthor[];
  audience: "client" | "team";
  authorName: string;
  label?: string;
}) {
  const [pending, setPending] = useState<TaskMessageWithAuthor | null>(null);
  const [optimistic] = useOptimistic(pending ? [...entries, pending] : entries);

  return (
    <>
      <TaskHistory entries={optimistic} audience={audience} />
      <div className="fixed inset-x-0 bottom-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] z-30 border-t border-[var(--line)] bg-[var(--surface)] md:static md:z-auto md:mt-6 md:border-0 md:bg-transparent">
        <div className="px-5 py-3 md:px-0 md:py-0">
          <AddNote
            taskId={taskId}
            label={label}
            onOptimistic={(body) =>
              setPending(
                body
                  ? {
                      id: `pending-${Date.now()}`,
                      task_id: taskId,
                      author_id: "",
                      body,
                      voice_path: null,
                      status_to: null,
                      created_at: new Date().toISOString(),
                      profiles: {
                        id: "",
                        full_name: authorName,
                        role: audience === "team" ? "admin" : "client",
                      },
                    }
                  : null,
              )
            }
          />
        </div>
      </div>
    </>
  );
}
