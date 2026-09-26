"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { markTaskRead } from "@/features/tasks/actions";

/**
 * Keeps an open request current. Marks it read on opening, then listens for new
 * messages or status changes and refreshes the thread when one arrives. The database's
 * row level security decides which changes this person is sent.
 */
export function LiveThread({ taskId, hadUnread }: { taskId: string; hadUnread: boolean }) {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    markTaskRead(taskId).then(() => {
      // Refresh once so the unread badges elsewhere clear straight away.
      if (hadUnread && !cancelled) router.refresh();
    });

    const supabase = createClient();
    const channel = supabase
      .channel(`task:${taskId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_messages", filter: `task_id=eq.${taskId}` },
        async () => {
          await markTaskRead(taskId);
          if (!cancelled) router.refresh();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "task_attachments", filter: `task_id=eq.${taskId}` },
        () => {
          if (!cancelled) router.refresh();
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [taskId, hadUnread, router]);

  return null;
}
