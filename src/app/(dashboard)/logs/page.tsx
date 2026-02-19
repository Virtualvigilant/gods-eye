"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import HolographicCard from "@/components/gods-eye/shared/holographic-card";

interface Alert {
  id: string;
  alert_type: string;
  severity: number;
  description: string;
  acknowledged: boolean;
  triggered_at: string;
  profiles?: { codename: string };
}

interface SystemEvent {
  id: number;
  event_type: string;
  severity: string;
  details: any;
  timestamp: string;
}

const severityColor = (s: number) =>
  s >= 5 ? "#ff0044" : s >= 4 ? "#ff6600" : s >= 3 ? "#ffbe0b" : s >= 2 ? "#4a9eff" : "#00ff88";

const eventSeverityColor = (s: string) => ({
  critical: "#ff0044",
  error:    "#ff006e",
  warning:  "#ffbe0b",
  info:     "#00f0ff",
}[s] ?? "#888888");

// ── Timeline entry ────────────────────────────────────────────────────────────
function TimelineEntry({ time, label, color, children }: {
  time: string; label: string; color: string; children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0">
        <div className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
          style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
        <div className="w-px flex-1 mt-1" style={{ background: `${color}20` }} />
      </div>
      {/* Content */}
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs font-bold tracking-wider" style={{ color, fontSize: "10px" }}>
            {label}
          </span>
          <span className="font-mono text-surveillance-cyan/25" style={{ fontSize: "9px" }}>{time}</span>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function LogsPage() {
  const [alerts, setAlerts]         = useState<Alert[]>([]);
  const [events, setEvents]         = useState<SystemEvent[]>([]);
  const [activeTab, setActiveTab]   = useState<"alerts" | "events">("alerts");
  const [severityFilter, setSeverity] = useState(0);
  const [loading, setLoading]       = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLogs() {
      const [alertsRes, eventsRes] = await Promise.all([
        supabase
          .from("alerts")
          .select("*, profiles(codename)")
          .order("triggered_at", { ascending: false })
          .limit(50),
        supabase
          .from("system_events")
          .select("*")
          .order("timestamp", { ascending: false })
          .limit(50),
      ]);
      if (alertsRes.data) setAlerts(alertsRes.data as Alert[]);
      if (eventsRes.data) setEvents(eventsRes.data as SystemEvent[]);
      setLoading(false);
    }
    fetchLogs();

    // Realtime alerts
    const channel = supabase
      .channel("logs-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alerts" }, (payload) => {
        setAlerts(prev => [payload.new as Alert, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const filteredAlerts = severityFilter === 0
    ? alerts
    : alerts.filter(a => a.severity === severityFilter);

  const acknowledgeAlert = async (id: string) => {
    await supabase.from("alerts").update({ acknowledged: true }).eq("id", id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="SYSTEM LOGS" subtitle="Activity & Audit Trail" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Stats bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "TOTAL ALERTS",       value: alerts.length,                              color: "#00f0ff" },
            { label: "UNACKNOWLEDGED",      value: alerts.filter(a => !a.acknowledged).length, color: "#ff006e" },
            { label: "CRITICAL (S4-5)",     value: alerts.filter(a => a.severity >= 4).length, color: "#ff0044" },
            { label: "SYSTEM EVENTS",       value: events.length,                              color: "#4a9eff" },
          ].map(s => (
            <HolographicCard key={s.label} className="p-4" animate>
              <p className="font-mono tracking-widest" style={{ fontSize: "9px", color: `${s.color}80` }}>
                {s.label}
              </p>
              <p className="font-display font-bold text-2xl mt-1"
                style={{ color: s.color, textShadow: `0 0 12px ${s.color}60` }}>
                {s.value}
              </p>
            </HolographicCard>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 border-b" style={{ borderColor: "rgba(0,240,255,0.08)" }}>
          {(["alerts", "events"] as const).map(t => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className="relative px-5 py-2.5 font-mono text-xs tracking-widest transition-colors duration-150"
              style={{ color: activeTab === t ? "#00f0ff" : "rgba(0,240,255,0.3)" }}
            >
              {t.toUpperCase()}
              {activeTab === t && (
                <motion.div layoutId="logs-tab"
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: "#00f0ff", boxShadow: "0 0 6px #00f0ff" }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Alerts tab */}
        {activeTab === "alerts" && (
          <div className="space-y-3">
            {/* Severity filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-surveillance-cyan/30 tracking-widest" style={{ fontSize: "9px" }}>
                SEVERITY:
              </span>
              {[0,1,2,3,4,5].map(s => (
                <button
                  key={s}
                  onClick={() => setSeverity(s)}
                  className="px-2 py-0.5 rounded font-mono transition-all duration-100"
                  style={{
                    fontSize: "9px",
                    background: severityFilter === s ? "rgba(0,240,255,0.1)" : "transparent",
                    border: `1px solid ${severityFilter === s ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.1)"}`,
                    color: s === 0 ? "#00f0ff" : severityColor(s),
                  }}
                >
                  {s === 0 ? "ALL" : `S-${s}`}
                </button>
              ))}
            </div>

            {/* Timeline */}
            <HolographicCard className="p-5">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
                </div>
              ) : (
                <AnimatePresence>
                  {filteredAlerts.map((alert, i) => {
                    const color = severityColor(alert.severity);
                    const time  = new Date(alert.triggered_at).toLocaleString("en-US", {
                      month: "short", day: "2-digit",
                      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
                    });
                    return (
                      <motion.div
                        key={alert.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.02 }}
                      >
                        <TimelineEntry time={time} label={alert.alert_type.replace(/_/g," ")} color={color}>
                          <div
                            className="rounded p-3 space-y-1"
                            style={{
                              background: `${color}06`,
                              border: `1px solid ${color}20`,
                              opacity: alert.acknowledged ? 0.5 : 1,
                            }}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="font-mono text-xs text-surveillance-cyan/60 leading-relaxed flex-1">
                                {alert.description}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {alert.profiles?.codename && (
                                  <span className="font-mono px-1.5 py-0.5 rounded"
                                    style={{ fontSize: "8px", color: "#00f0ff", background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.15)" }}>
                                    {alert.profiles.codename}
                                  </span>
                                )}
                                <span className="font-mono font-bold" style={{ fontSize: "9px", color }}>
                                  S-{alert.severity}
                                </span>
                                {!alert.acknowledged && (
                                  <button
                                    onClick={() => acknowledgeAlert(alert.id)}
                                    className="font-mono px-2 py-0.5 rounded transition-colors hover:bg-surveillance-cyan/10"
                                    style={{ fontSize: "8px", border: "1px solid rgba(0,240,255,0.2)", color: "rgba(0,240,255,0.5)" }}
                                  >
                                    ACK
                                  </button>
                                )}
                                {alert.acknowledged && (
                                  <span className="font-mono" style={{ fontSize: "8px", color: "#00ff88" }}>✓ ACK</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </TimelineEntry>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
            </HolographicCard>
          </div>
        )}

        {/* Events tab */}
        {activeTab === "events" && (
          <HolographicCard className="p-5">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
              </div>
            ) : events.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2">
                <p className="font-mono text-xs text-surveillance-cyan/30 tracking-widest">NO SYSTEM EVENTS LOGGED</p>
              </div>
            ) : (
              events.map((evt, i) => {
                const color = eventSeverityColor(evt.severity);
                const time  = new Date(evt.timestamp).toLocaleString("en-US", {
                  month: "short", day: "2-digit",
                  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
                });
                return (
                  <motion.div key={evt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}>
                    <TimelineEntry time={time} label={evt.event_type.replace(/_/g," ")} color={color}>
                      <div className="rounded p-2" style={{ background: `${color}06`, border: `1px solid ${color}15` }}>
                        <p className="font-mono text-xs text-surveillance-cyan/50">
                          {JSON.stringify(evt.details)}
                        </p>
                      </div>
                    </TimelineEntry>
                  </motion.div>
                );
              })
            )}
          </HolographicCard>
        )}
      </div>
    </div>
  );
}