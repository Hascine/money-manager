import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/** True only after the client has hydrated. Needed for next-themes, whose
 * `theme` value is read from localStorage on the client but is unknown
 * during SSR — gating on this (instead of `useEffect` + `setState`, which
 * both causes an extra render and can still race the mismatch) keeps the
 * server and first client render identical, avoiding a hydration mismatch. */
export function useHasMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
