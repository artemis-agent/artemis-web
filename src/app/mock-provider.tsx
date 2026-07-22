"use client";

import { useEffect, useState, type ReactNode } from "react";

export function MockProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const enabled = process.env.NEXT_PUBLIC_MOCK_API === "true";

  useEffect(() => {
    if (!enabled) {
      setReady(true);
      return;
    }
    import("@/mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" }).then(() => setReady(true));
    });
  }, [enabled]);

  if (!enabled) return children;

  return ready ? children : (
    <div className="min-h-screen bg-[#141416] flex items-center justify-center">
      <p className="text-sm text-[#8f8f8f] font-mono">Starting mock server...</p>
    </div>
  );
}
