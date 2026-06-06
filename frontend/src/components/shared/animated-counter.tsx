"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedCounter({
  value,
  duration = 1.2,
  suffix = "",
  prefix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (v) =>
    `${prefix}${Math.round(v).toLocaleString()}${suffix}`
  );
  const [text, setText] = useState(`${prefix}0${suffix}`);

  useEffect(() => {
    spring.set(value);
    return display.on("change", (v) => setText(v));
  }, [value, spring, display, prefix, suffix]);

  return (
    <motion.span className={className} key={value}>
      {text}
    </motion.span>
  );
}
