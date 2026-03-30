"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import HolographicCard from "../shared/holographic-card";

interface Props {
  label: string;
  value: number;
  suffix?: string;
  color?: "cyan" | "magenta" | "amber" | "danger";
  sublabel?: string;
  animate?: boolean;
}

const colorMap = {
  cyan:    "#00f0ff",
  magenta: "#ff006e",
  amber:   "#ffbe0b",
  danger:  "#ff0044",
};

export default function StatWidget({ label, value, suffix = "", color = "cyan", sublabel, animate = true }: Props) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!animate) { setDisplay(value); return; }
    let start = 0;
    const step = value / 40;
    const t = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(t); }
      else setDisplay(Math.floor(start));
    }, 30);
    return () => clearInterval(t);
  }, [value, animate]);

  const c = colorMap[color];

  return (
    <HolographicCard glowColor={color} animate className="p-5">
      <p className="font-mono text-xs tracking-widest mb-2" style={{ color: `${c}80` }}>
        {label}
      </p>
      <div className="flex items-end gap-1">
        <motion.span
          className="font-display font-bold tabular-nums"
          style={{ fontSize: "2.5rem", lineHeight: 1, color: c, textShadow: `0 0 20px ${c}60` }}
        >
          {display.toLocaleString()}
        </motion.span>
        {suffix && (
          <span className="font-mono text-sm mb-1" style={{ color: `${c}60` }}>{suffix}</span>
        )}
      </div>
      {sublabel && (
        <p className="font-mono mt-1" style={{ fontSize: "10px", color: `${c}40` }}>{sublabel}</p>
      )}
      {/* Bottom bar */}
      <div className="mt-3 h-px w-full" style={{ background: `linear-gradient(90deg, ${c}40, transparent)` }} />
    </HolographicCard>
  );
}