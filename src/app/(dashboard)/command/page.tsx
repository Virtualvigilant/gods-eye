"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import HolographicCard from "@/components/gods-eye/shared/holographic-card";
import StatWidget from "@/components/gods-eye/command-dashboard/stat-widget";
import AlertsFeed from "@/components/gods-eye/command-dashboard/alerts-feed";
import TargetsTable from "@/components/gods-eye/command-dashboard/targets-table";
import { ThreatGauge } from "@/components/gods-eye/shared/threat-indicator";
import { createClient } from "@/lib/supabase/client";

// ── Scrolling data stream ─────────────────────────────────────────────────────
function DataStream() {
  const lines = Array.from({ length: 20 }, (_, i) => {
    const hex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(" ");
    return `0x${(i * 0x10).toString(16).padStart(4, "0")}  ${hex}`;
  });

  return (
    <div className="overflow-hidden h-full opacity-20 select-none pointer-events-none">
      <motion.div
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="font-mono text-surveillance-cyan space-y-1 px-3 py-2"
        style={{ fontSize: "9px" }}
      >
        {[...lines, ...lines].map((line, i) => (
          <div key={i} className="whitespace-nowrap tracking-wider">{line}</div>
        ))}
      </motion.div>
    </div>
  );
}

// ── Global threat level ───────────────────────────────────────────────────────
function GlobalThreatWidget({ level }: { level: number }) {
  return (
    <HolographicCard
      glowColor={level >= 4 ? "danger" : level >= 3 ? "amber" : "cyan"}
      animate
      className="flex flex-col items-center justify-center p-6 h-full"
    >
      <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-4">
        GLOBAL THREAT LEVEL
      </p>
      <ThreatGauge level={level} size={140} />
      <p className="font-mono text-xs text-surveillance-cyan/30 mt-4 tracking-wider">
        UPDATED 30s AGO
      </p>
    </HolographicCard>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CommandPage() {
  const [stats, setStats] = useState({ total: 0, active: 0, flagged: 0, critical: 0 });
  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      const [total, active, flagged, critical] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "flagged"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("threat_level", 4),
      ]);
      setStats({
        total:    total.count    ?? 0,
        active:   active.count   ?? 0,
        flagged:  flagged.count  ?? 0,
        critical: critical.count ?? 0,
      });
    }
    fetchStats();
  }, []);

  // Derive global threat from critical count
  const globalThreat = stats.critical >= 8 ? 5 : stats.critical >= 5 ? 4 : stats.critical >= 3 ? 3 : stats.critical >= 1 ? 2 : 1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="COMMAND CENTER" subtitle="Global Situational Overview" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Row 1: Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatWidget label="TOTAL TARGETS"   value={stats.total}    color="cyan"    sublabel="ALL PROFILES"        />
          <StatWidget label="ACTIVE"           value={stats.active}   color="cyan"    sublabel="CURRENTLY MONITORED" />
          <StatWidget label="FLAGGED"          value={stats.flagged}  color="amber"   sublabel="ELEVATED WATCH"      />
          <StatWidget label="CRITICAL THREAT"  value={stats.critical} color="danger"  sublabel="THREAT LEVEL 4-5"    />
        </div>

        {/* ── Row 2: Threat + Data stream + Feeds ── */}
        <div className="grid grid-cols-12 gap-3" style={{ height: "200px" }}>
          <div className="col-span-12 md:col-span-3">
            <GlobalThreatWidget level={globalThreat} />
          </div>
          <div className="col-span-12 md:col-span-3">
            <HolographicCard animate className="h-full overflow-hidden">
              <p className="font-mono text-xs tracking-widest text-surveillance-cyan/40 px-3 pt-3 pb-1">
                DATA STREAM
              </p>
              <DataStream />
            </HolographicCard>
          </div>
          <div className="col-span-12 md:col-span-6">
            <HolographicCard animate className="h-full p-4 flex flex-col justify-between">
              <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-3">
                SURVEILLANCE FEED STATUS
              </p>
              <div className="grid grid-cols-3 gap-3 flex-1">
                {[
                  { label: "CCTV",      count: 89,  status: "ACTIVE"      },
                  { label: "SATELLITE", count: 12,  status: "ACTIVE"      },
                  { label: "TRAFFIC",   count: 67,  status: "ACTIVE"      },
                  { label: "DRONE",     count: 8,   status: "STANDBY"     },
                  { label: "ATM CAM",   count: 43,  status: "ACTIVE"      },
                  { label: "PRIVATE",   count: 28,  status: "COMPROMISED" },
                ].map((feed) => (
                  <div
                    key={feed.label}
                    className="rounded p-2"
                    style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.08)" }}
                  >
                    <p className="font-mono font-bold text-surveillance-cyan" style={{ fontSize: "11px" }}>
                      {feed.count}
                    </p>
                    <p className="font-mono text-surveillance-cyan/40" style={{ fontSize: "9px" }}>{feed.label}</p>
                    <p
                      className="font-mono"
                      style={{
                        fontSize: "8px",
                        color: feed.status === "ACTIVE" ? "#00ff88"
                          : feed.status === "COMPROMISED" ? "#ff006e" : "#ffbe0b",
                      }}
                    >
                      {feed.status}
                    </p>
                  </div>
                ))}
              </div>
            </HolographicCard>
          </div>
        </div>

        {/* ── Row 3: Targets table + Alerts ── */}
        <div className="grid grid-cols-12 gap-3" style={{ minHeight: "380px" }}>
          <div className="col-span-12 lg:col-span-8 flex flex-col">
            <TargetsTable />
          </div>
          <div className="col-span-12 lg:col-span-4 flex flex-col">
            <AlertsFeed />
          </div>
        </div>

      </div>
    </div>
  );
}