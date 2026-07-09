import { useCallback } from "react";
import type { Ref, RefCallback } from "react";

/** Combines multiple refs (from separate hooks) into one callback ref for a single element. */
export function useMergedRef<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
  return useCallback(
    (node: T) => {
      refs.forEach((ref) => {
        if (!ref) return;
        if (typeof ref === "function") ref(node);
        else (ref as React.RefObject<T | null>).current = node;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
