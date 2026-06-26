import { useEffect, useState } from "react";
import type { DataSource } from "./source";

interface AsyncResult<T> {
  data: T | null;
  loading: boolean;
  source: DataSource | null;
}

/** Run an API-first loader on mount, exposing data, loading and the data source. */
export function useLoader<T>(
  loader: (signal: AbortSignal) => Promise<{ data: T; source: DataSource }>,
  deps: unknown[] = []
): AsyncResult<T> {
  const [state, setState] = useState<AsyncResult<T>>({
    data: null,
    loading: true,
    source: null
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true }));
    loader(controller.signal)
      .then(({ data, source }) => setState({ data, loading: false, source }))
      .catch(() => setState({ data: null, loading: false, source: "offline" }));
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
