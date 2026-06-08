/**
 * useSupabaseRealtime
 * Subscribe to Supabase Realtime changes for a given table.
 * Calls `onInsert`, `onUpdate`, `onDelete` callbacks when rows change.
 * Automatically unsubscribes on component unmount.
 */
import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type AnyRecord = Record<string, unknown>;

interface UseSupabaseRealtimeOptions<T extends AnyRecord> {
  table: string;
  /** Optional filter e.g. "user_id=eq.123" */
  filter?: string;
  onInsert?: (row: T) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (oldRow: Partial<T>) => void;
  /** If false, subscription is not created */
  enabled?: boolean;
}

export function useSupabaseRealtime<T extends AnyRecord>({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  enabled = true,
}: UseSupabaseRealtimeOptions<T>) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const channelName = `realtime-${table}-${filter ?? "all"}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase.channel(channelName);

    channel.on(
      "postgres_changes" as Parameters<typeof channel.on>[0],
      {
        event: "*",
        schema: "public",
        table,
        ...(filter ? { filter } : {}),
      },
      (payload: RealtimePostgresChangesPayload<T>) => {
        if (payload.eventType === "INSERT" && onInsert) {
          onInsert(payload.new as T);
        } else if (payload.eventType === "UPDATE" && onUpdate) {
          onUpdate(payload.new as T);
        } else if (payload.eventType === "DELETE" && onDelete) {
          onDelete(payload.old as Partial<T>);
        }
      }
    );

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log(`[Realtime] Subscribed to ${table}`);
      }
    });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [table, filter, enabled]);
}
