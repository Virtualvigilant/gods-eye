"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import HolographicCard from "../shared/holographic-card";

interface Alert {
  id: string;
  alert_type: string;
  severity: number;
  description: string;
  acknowledged: boolean;
  triggered_at: string;
  profiles?: { codename: string };
}

const severityColor = (s: number) =>
  s >= 5 ? "#ff0044" : s >= 4 ? "#ff6600" : s >= 3 ? "#ffbe0b" : s >= 2 ? "#4a9eff" : "#00ff88";

export default function AlertsFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
    supabase
      .from("alerts")
      .select("*, profiles(codename)")
      .order("triggered_at", { ascending: false })
      .limit(12)
      .then(({ data }) => { if (data) setAlerts(data as Alert[]); });

    // Realtime subscription
    const channel = supabase
      .channel("alerts-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
        setAlerts(prev => [payload.new as Alert, ...prev.slice(0, 11)]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <HolographicCard className="flex flex-col h-full" glowColor="magenta">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,0,110,0.15)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-surveillance-magenta animate-pulse" style={{ boxShadow: "0 0 6px #ff006e" }} />
          <p className="font-mono text-xs tracking-widest text-surveillance-magenta">LIVE ALERTS</p>
        </div>
        <span className="font-mono text-xs text-surveillance-magenta/40">{alerts.length} ACTIVE</span>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        <AnimatePresence initial={false}>
          {alerts.map((alert) => {
            const color = severityColor(alert.severity);
            const time = new Date(alert.triggered_at).toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit" });
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative rounded px-3 py-2 cursor-pointer group"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-mono text-xs font-bold tracking-wider" style={{ color, fontSize: "10px" }}>
                        {alert.alert_type.replace(/_/g, " ")}
                      </span>
                      {alert.profiles?.codename && (
                        <span className="font-mono text-xs text-surveillance-cyan/40" style={{ fontSize: "9px" }}>
                          [{alert.profiles.codename}]
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-xs text-surveillance-cyan/50 leading-tight truncate">
                      {alert.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="font-mono text-xs" style={{ color, fontSize: "9px" }}>S-{alert.severity}</span>
                    <span className="font-mono text-surveillance-cyan/30" style={{ fontSize: "9px" }}>{time}</span>
                  </div>
                </div>
                {/* Severity bar */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l" style={{ background: color }} />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </HolographicCard>
  );
}