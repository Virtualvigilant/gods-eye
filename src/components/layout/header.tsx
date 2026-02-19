"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function Header({ title, subtitle }: { title: string; subtitle?: string }) {
    const [time, setTime] = useState<Date | null>(null);
    const [alerts] = useState(3);

    useEffect(() => {
        setTime(new Date());
        const t = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    return (
        <header
            className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
            style={{
                background: "rgba(10,15,28,0.95)",
                borderColor: "rgba(0,240,255,0.1)",
                backdropFilter: "blur(8px)",
            }}
        >
            {/* Left: page title */}
            <div>
                <h2 className="font-display font-bold text-lg text-surveillance-cyan tracking-widest">
                    {title}
                </h2>
                {subtitle && (
                    <p className="font-mono text-xs text-surveillance-cyan/40 tracking-wider">{subtitle}</p>
                )}
            </div>

            {/* Right: system status bar */}
            <div className="flex items-center gap-6">

                {/* System status indicators */}
                <div className="hidden md:flex items-center gap-4">
                    {[
                        { label: "UPLINK", status: "ACTIVE", color: "#00ff88" },
                        { label: "FEEDS", status: "247", color: "#00f0ff" },
                        { label: "ENCRYPT", status: "AES-256", color: "#4a9eff" },
                    ].map((s) => (
                        <div key={s.label} className="text-right">
                            <p className="font-mono text-xs" style={{ color: s.color, fontSize: "10px" }}>
                                {s.status}
                            </p>
                            <p className="font-mono text-xs text-surveillance-cyan/30" style={{ fontSize: "9px" }}>
                                {s.label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-surveillance-cyan/10" />

                {/* Alerts bell */}
                <div className="relative cursor-pointer group">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(0,240,255,0.5)"
                        strokeWidth={1.5}
                        className="w-5 h-5 group-hover:stroke-surveillance-cyan transition-colors"
                    >
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                    </svg>
                    {alerts > 0 && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ background: "#ff006e", boxShadow: "0 0 6px rgba(255,0,110,0.6)" }}
                        >
                            <span className="font-mono text-white" style={{ fontSize: "9px" }}>{alerts}</span>
                        </motion.div>
                    )}
                </div>

                {/* Clock */}
                <div className="text-right">
                    <p className="font-mono text-sm text-surveillance-cyan tabular-nums">
                        {time ? time.toLocaleTimeString("en-US", { hour12: false }) : "--:--:--"}
                    </p>
                    <p className="font-mono text-surveillance-cyan/30" style={{ fontSize: "10px" }}>
                        {time ? time.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase() : "---"}
                    </p>
                </div>
            </div>
        </header>
    );
}