"use client";

import * as React from "react";

const COMPACT_VIEWPORT_QUERY = "(max-width: 1023px)";

export function useIsCompactViewport() {
  return React.useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia(COMPACT_VIEWPORT_QUERY);
      mediaQuery.addEventListener("change", callback);
      return () => mediaQuery.removeEventListener("change", callback);
    },
    () => window.matchMedia(COMPACT_VIEWPORT_QUERY).matches,
    () => true,
  );
}
