"use client";

import { useCounter } from "@/hooks/use-counter";
import { useInView } from "@/hooks/use-in-view";

interface AnimatedCounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

export function AnimatedCounter({
  end,
  suffix = "",
  prefix = "",
  duration = 2000,
}: AnimatedCounterProps) {
  const { ref, inView } = useInView();
  const count = useCounter(end, duration, inView);

  return (
    <span ref={ref}>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
