"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "magenta" | "amber" | "danger";
  animate?: boolean;
}

const glowMap = {
  cyan:    "rgba(0,240,255,0.12)",
  magenta: "rgba(255,0,110,0.12)",
  amber:   "rgba(255,190,11,0.12)",
  danger:  "rgba(255,0,68,0.12)",
};

const borderMap = {
  cyan:    "rgba(0,240,255,0.2)",
  magenta: "rgba(255,0,110,0.2)",
  amber:   "rgba(255,190,11,0.2)",
  danger:  "rgba(255,0,68,0.2)",
};

export default function HolographicCard({
  children,
  className = "",
  glowColor = "cyan",
  animate = false,
}: Props) {
  return (
    <motion.div
      initial={animate ? { opacity: 0, y: 12 } : false}
      animate={animate ? { opacity: 1, y: 0 } : false}
      className={`relative rounded overflow-hidden ${className}`}
      style={{
        background: `linear-gradient(135deg, #0a0f1c 0%, #050810 100%)`,
        border: `1px solid ${borderMap[glowColor]}`,
        boxShadow: `0 0 20px ${glowMap[glowColor]}, inset 0 0 20px ${glowMap[glowColor]}`,
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${borderMap[glowColor].replace("0.2","0.8")}, transparent)`,
        }}
      />
      {/* Corner brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t border-l" style={{ borderColor: borderMap[glowColor].replace("0.2","0.5") }} />
      <div className="absolute top-2 right-2 w-3 h-3 border-t border-r" style={{ borderColor: borderMap[glowColor].replace("0.2","0.5") }} />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l" style={{ borderColor: borderMap[glowColor].replace("0.2","0.5") }} />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r" style={{ borderColor: borderMap[glowColor].replace("0.2","0.5") }} />

      {children}
    </motion.div>
  );
}