import { useEffect, useState } from "react";

/** Returns a timestamp (ms) that updates every 60 seconds. */
export function useCurrentTime(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}
