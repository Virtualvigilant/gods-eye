"use client";

import { motion } from "framer-motion";

const THREAT_CONFIG = {
  1: { color: "#00ff88", label: "MINIMAL",  bg: "rgba(0,255,136,0.1)"  },
  2: { color: "#4a9eff", label: "LOW",       bg: "rgba(74,158,255,0.1)" },
  3: { color: "#ffbe0b", label: "MODERATE",  bg: "rgba(255,190,11,0.1)" },
  4: { color: "#ff6600", label: "HIGH",      bg: "rgba(255,102,0,0.1)"  },
  5: { color: "#ff0044", label: "CRITICAL",  bg: "rgba(255,0,68,0.1)"   },
};

export function ThreatBadge({ level }: { level: number }) {
  const cfg = THREAT_CONFIG[level as keyof typeof THREAT_CONFIG] ?? THREAT_CONFIG[1];
  return (
    <span
      className="font-mono text-xs px-2 py-0.5 rounded tracking-widest"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}40` }}
    >
      T-{level} {cfg.label}
    </span>
  );
}

export function ThreatGauge({ level, size = 120 }: { level: number; size?: number }) {
  const cfg = THREAT_CONFIG[level as keyof typeof THREAT_CONFIG] ?? THREAT_CONFIG[1];
  const segments = 5;
  const radius = size / 2 - 10;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: segments }, (_, i) => {
          const startAngle = (i / segments) * 270 - 225;
          const endAngle   = ((i + 0.85) / segments) * 270 - 225;
          const s = (a: number) => ({ x: cx + radius * Math.cos((a * Math.PI) / 180), y: cy + radius * Math.sin((a * Math.PI) / 180) });
          const s1 = s(startAngle), s2 = s(endAngle);
          const active = i < level;
          const segColor = THREAT_CONFIG[(i + 1) as keyof typeof THREAT_CONFIG].color;
          return (
            <path
              key={i}
              d={`M ${s1.x} ${s1.y} A ${radius} ${radius} 0 0 1 ${s2.x} ${s2.y}`}
              fill="none"
              strokeWidth={6}
              strokeLinecap="round"
              stroke={active ? segColor : "rgba(255,255,255,0.06)"}
              style={{ filter: active ? `drop-shadow(0 0 4px ${segColor})` : "none" }}
            />
          );
        })}
        {/* Center text */}
        <text x={cx} y={cy - 4} textAnchor="middle" fill={cfg.color} fontSize={size * 0.22} fontFamily="JetBrains Mono, monospace" fontWeight="700">
          {level}
        </text>
        <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill={cfg.color} fontSize={size * 0.09} fontFamily="JetBrains Mono, monospace" opacity={0.7}>
          {cfg.label}
        </text>
      </svg>
      {/* Pulse for high threat */}
      {level >= 4 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ opacity: [0.3, 0, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ border: `2px solid ${cfg.color}`, borderRadius: "50%" }}
        />
      )}
    </div>
  );
}