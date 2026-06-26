import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { enqueue, flushOutbox, isMutation, type RawFetch } from "./offline";

const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api/v1";
const STORAGE_KEY = "astrobsm.auth";

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  fullName: string;
  roles: string[];
  locale: string;
  status?: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasRole: (...roles: string[]) => boolean;
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => void;
  /** fetch wrapper that injects the access token and refreshes once on 401. */
  authFetch: (path: string, init?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function load(): AuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AuthState;
  } catch {
    /* ignore */
  }
  return { user: null, accessToken: null, refreshToken: null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(load);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = useCallback(async (identifier: string, password: string) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password })
    });
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error?.message ?? "Login failed");
    }
    const data = await res.json();
    setState({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken
    });
  }, []);

  const logout = useCallback(() => {
    setState({ user: null, accessToken: null, refreshToken: null });
  }, []);

  // Raw, auth-injected fetch (refreshes once on 401). May throw when offline.
  const rawFetch = useCallback<RawFetch>(
    async (path, init: RequestInit = {}): Promise<Response> => {
      const withAuth = (token: string | null): RequestInit => ({
        ...init,
        headers: {
          ...(init.headers ?? {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });

      let res = await fetch(`${BASE}${path}`, withAuth(state.accessToken));
      if (res.status === 401 && state.refreshToken) {
        const refresh = await fetch(`${BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: state.refreshToken })
        });
        if (refresh.ok) {
          const { accessToken } = await refresh.json();
          setState((s) => ({ ...s, accessToken }));
          res = await fetch(`${BASE}${path}`, withAuth(accessToken));
        } else {
          logout();
        }
      }
      return res;
    },
    [state.accessToken, state.refreshToken, logout]
  );

  // Synthetic 202 response returned when a mutation is queued for later sync.
  const queuedResponse = (id: string): Response =>
    new Response(JSON.stringify({ data: { id, queued: true }, queued: true }), {
      status: 202,
      headers: { "Content-Type": "application/json" }
    });

  // Public fetch: transparently queues mutations when offline and replays later.
  const authFetch = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const method = (init.method ?? "GET").toUpperCase();
      const queueable = isMutation(method);

      if (queueable && typeof navigator !== "undefined" && !navigator.onLine) {
        const entry = enqueue({
          method,
          path,
          body: typeof init.body === "string" ? init.body : undefined,
          contentType: (init.headers as Record<string, string> | undefined)?.["Content-Type"]
        });
        return queuedResponse(entry.id);
      }

      try {
        return await rawFetch(path, init);
      } catch (err) {
        if (queueable) {
          const entry = enqueue({
            method,
            path,
            body: typeof init.body === "string" ? init.body : undefined,
            contentType: (init.headers as Record<string, string> | undefined)?.["Content-Type"]
          });
          return queuedResponse(entry.id);
        }
        throw err;
      }
    },
    [rawFetch]
  );

  // Replay any queued mutations on mount and whenever we come back online.
  const flushing = useRef(false);
  useEffect(() => {
    if (!state.accessToken) return;
    const run = async () => {
      if (flushing.current || !navigator.onLine) return;
      flushing.current = true;
      try {
        await flushOutbox(rawFetch);
      } finally {
        flushing.current = false;
      }
    };
    void run();
    window.addEventListener("online", run);
    return () => window.removeEventListener("online", run);
  }, [state.accessToken, rawFetch]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: state.user,
      isAuthenticated: Boolean(state.accessToken),
      hasRole: (...roles: string[]) =>
        Boolean(state.user?.roles.some((r) => roles.includes(r))),
      login,
      logout,
      authFetch
    }),
    [state.user, state.accessToken, login, logout, authFetch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
