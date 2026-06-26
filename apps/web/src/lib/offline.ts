/**
 * Offline support for field use (PWA).
 *
 * Two parts:
 *  1. Read caching is handled by the service worker (NetworkFirst on API GETs),
 *     configured in vite.config.ts — so previously-fetched content stays
 *     viewable offline.
 *  2. Write queueing lives here: mutations issued while offline are stored in an
 *     "outbox" (localStorage) and replayed in order when connectivity returns.
 *
 * No data is fabricated — the outbox only ever replays requests the user
 * actually made. Poison entries that the server rejects (4xx) are dropped so the
 * queue can never get stuck.
 */
import { useEffect, useState } from "react";

const OUTBOX_KEY = "astrobsm.outbox";
const EVENT = "astrobsm:outbox";

export interface OutboxEntry {
  id: string;
  method: string;
  path: string;
  body?: string;
  contentType?: string;
  createdAt: string;
}

/** Low-level network call that already injects auth and may throw when offline. */
export type RawFetch = (path: string, init?: RequestInit) => Promise<Response>;

export function isMutation(method: string): boolean {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase());
}

function read(): OutboxEntry[] {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    return raw ? (JSON.parse(raw) as OutboxEntry[]) : [];
  } catch {
    return [];
  }
}

function write(entries: OutboxEntry[]): void {
  localStorage.setItem(OUTBOX_KEY, JSON.stringify(entries));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function outboxCount(): number {
  return read().length;
}

export function enqueue(entry: Omit<OutboxEntry, "id" | "createdAt">): OutboxEntry {
  const full: OutboxEntry = {
    ...entry,
    id: `ob-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString()
  };
  write([...read(), full]);
  return full;
}

/**
 * Replay queued mutations in order. Stops on the first network failure (will
 * retry next time we're online); drops entries the server rejects with a 4xx so
 * the queue cannot deadlock. Returns counts for UI feedback.
 */
export async function flushOutbox(raw: RawFetch): Promise<{ sent: number; dropped: number }> {
  let sent = 0;
  let dropped = 0;
  let queue = read();

  while (queue.length > 0) {
    const entry = queue[0];
    try {
      const res = await raw(entry.path, {
        method: entry.method,
        headers: entry.contentType ? { "Content-Type": entry.contentType } : undefined,
        body: entry.body
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        // Success, or a permanent client error we can't fix by retrying.
        if (!res.ok) dropped += 1;
        else sent += 1;
        queue = queue.slice(1);
        write(queue);
      } else {
        // Server/5xx — keep for later.
        break;
      }
    } catch {
      // Network error — still offline. Keep the queue and stop.
      break;
    }
    queue = read();
  }

  return { sent, dropped };
}

// --- Hooks ------------------------------------------------------------------

export function useOnline(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);
  return online;
}

export function useOutboxCount(): number {
  const [count, setCount] = useState(() => outboxCount());
  useEffect(() => {
    const update = () => setCount(outboxCount());
    window.addEventListener(EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return count;
}
