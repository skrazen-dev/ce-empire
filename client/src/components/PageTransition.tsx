import { useEffect, useRef, useState } from "react";

interface PageTransitionProps {
  pageKey: string;
  children: React.ReactNode;
}

/**
 * Wraps page content with a smooth fade+slide-up transition.
 * Triggers whenever `pageKey` changes.
 */
export function PageTransition({ pageKey, children }: PageTransitionProps) {
  const [visible, setVisible] = useState(false);
  const prevKey = useRef<string | null>(null);

  useEffect(() => {
    if (prevKey.current !== pageKey) {
      // Reset to hidden, then animate in on next frame
      setVisible(false);
      const raf = requestAnimationFrame(() => {
        requestAnimationFrame(() => setVisible(true));
      });
      prevKey.current = pageKey;
      return () => cancelAnimationFrame(raf);
    }
  }, [pageKey]);

  // Initial mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 20);
    prevKey.current = pageKey;
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: visible
          ? "opacity 0.28s cubic-bezier(0.23,1,0.32,1), transform 0.28s cubic-bezier(0.23,1,0.32,1)"
          : "none",
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
