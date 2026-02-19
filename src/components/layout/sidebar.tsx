"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  {
    href: "/command",
    label: "COMMAND",
    sublabel: "Global Overview",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/tracking",
    label: "TRACKING",
    sublabel: "Live Map",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="8" strokeDasharray="3 2" />
        <line x1="12" y1="2" x2="12" y2="5" />
        <line x1="12" y1="19" x2="12" y2="22" />
        <line x1="2" y1="12" x2="5" y2="12" />
        <line x1="19" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "SEARCH",
    sublabel: "Query System",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="11" cy="11" r="7" />
        <line x1="16.5" y1="16.5" x2="22" y2="22" />
      </svg>
    ),
  },
  {
    href: "/network",
    label: "NETWORK",
    sublabel: "Relationships",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="5" r="2" />
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="19" r="2" />
        <line x1="12" y1="7" x2="5" y2="17" />
        <line x1="12" y1="7" x2="19" y2="17" />
        <line x1="5" y1="19" x2="19" y2="19" />
      </svg>
    ),
  },
  {
    href: "/logs",
    label: "LOGS",
    sublabel: "Activity History",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="8" y1="13" x2="16" y2="13" />
        <line x1="8" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "SETTINGS",
    sublabel: "Configuration",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 220 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-screen border-r overflow-hidden flex-shrink-0"
      style={{
        background: "linear-gradient(180deg, #0a0f1c 0%, #050810 100%)",
        borderColor: "rgba(0,240,255,0.1)",
      }}
    >
      {/* Top glow line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,240,255,0.4), transparent)" }}
      />

      {/* Logo area */}
      <div className="flex items-center gap-3 px-4 py-5 border-b" style={{ borderColor: "rgba(0,240,255,0.08)" }}>
        {/* Radar icon */}
        <div className="relative w-8 h-8 flex-shrink-0">
          <div className="absolute inset-0 rounded-full border border-surveillance-cyan/30" />
          <div className="absolute inset-1 rounded-full border border-surveillance-cyan/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-surveillance-cyan shadow-glow-cyan" />
          </div>
          <div
            className="absolute inset-0 rounded-full animate-radar-sweep"
            style={{
              background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,240,255,0.3) 360deg)",
            }}
          />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <p
                className="font-display font-bold text-sm tracking-[0.15em] text-surveillance-cyan"
                style={{ textShadow: "0 0 10px rgba(0,240,255,0.5)" }}
              >
                GOD&apos;S EYE
              </p>
              <p className="font-mono text-xs text-surveillance-cyan/30 tracking-wider">
                v4.7.1 SECURE
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                className="relative flex items-center gap-3 px-3 py-2.5 rounded cursor-pointer group transition-all duration-150"
                style={{
                  background: isActive ? "rgba(0,240,255,0.08)" : "transparent",
                  borderLeft: isActive ? "2px solid rgba(0,240,255,0.7)" : "2px solid transparent",
                }}
                whileHover={{ x: 2 }}
              >
                {/* Hover bg */}
                {!isActive && (
                  <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                    style={{ background: "rgba(0,240,255,0.04)" }} />
                )}

                {/* Icon */}
                <span
                  className="flex-shrink-0 transition-colors duration-150"
                  style={{ color: isActive ? "#00f0ff" : "rgba(0,240,255,0.4)" }}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <p
                        className="font-mono text-xs font-bold tracking-widest leading-none"
                        style={{ color: isActive ? "#00f0ff" : "rgba(0,240,255,0.5)" }}
                      >
                        {item.label}
                      </p>
                      <p className="font-mono text-xs mt-0.5" style={{ color: "rgba(0,240,255,0.25)", fontSize: "10px" }}>
                        {item.sublabel}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator dot */}
                {isActive && (
                  <div className="absolute right-2 w-1 h-1 rounded-full bg-surveillance-cyan shadow-glow-cyan" />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Operator status */}
      <div className="border-t px-3 py-3" style={{ borderColor: "rgba(0,240,255,0.08)" }}>
        <div className="flex items-center gap-2">
          <div className="relative flex-shrink-0">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.3)" }}
            >
              <span className="font-mono text-xs text-surveillance-cyan">OP</span>
            </div>
            <div
              className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-surveillance-deepest"
              style={{ background: "#00ff88" }}
            />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="font-mono text-xs text-surveillance-cyan/70">OPERATOR-01</p>
                <p className="font-mono text-xs text-surveillance-success/60" style={{ fontSize: "10px" }}>
                  ● ONLINE
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all duration-150 hover:scale-110"
        style={{
          background: "#0a0f1c",
          border: "1px solid rgba(0,240,255,0.3)",
          color: "rgba(0,240,255,0.6)",
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          className="text-xs leading-none"
        >
          ›
        </motion.span>
      </button>
    </motion.aside>
  );
}