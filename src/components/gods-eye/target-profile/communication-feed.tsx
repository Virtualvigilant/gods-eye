"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import HolographicCard from "../shared/holographic-card";

interface Comm {
  id: number;
  communication_type: string;
  direction: string;
  timestamp: string;
  content_preview: string;
  content_full: string;
  encryption_status: string;
  metadata: any;
  profiles: { codename: string } | null;
}

const typeColor = (t: string) => ({
  sms:               "#00f0ff",
  voice:             "#00ff88",
  email:             "#4a9eff",
  encrypted_message: "#ff006e",
  dark_web:          "#ffbe0b",
  unknown:           "#888888",
}[t] ?? "#888888");

const typeIcon = (t: string) => ({
  sms:               "◉",
  voice:             "◎",
  email:             "▣",
  encrypted_message: "⬡",
  dark_web:          "◈",
  unknown:           "◌",
}[t] ?? "◌");

function DecryptButton({ onDecrypt, decrypted }: { onDecrypt: () => void; decrypted: boolean }) {
  return (
    <button
      onClick={onDecrypt}
      className="font-mono text-xs px-2 py-0.5 rounded transition-all duration-200"
      style={{
        border: "1px solid rgba(0,240,255,0.3)",
        color: decrypted ? "#00ff88" : "#00f0ff",
        background: decrypted ? "rgba(0,255,136,0.08)" : "rgba(0,240,255,0.06)",
        fontSize: "9px",
      }}
    >
      {decrypted ? "✓ DECRYPTED" : "DECRYPT"}
    </button>
  );
}

export default function CommunicationFeed({ profileId }: { profileId: string }) {
  const [comms, setComms]           = useState<Comm[]>([]);
  const [decrypted, setDecrypted]   = useState<Set<number>>(new Set());
  const [expanded, setExpanded]     = useState<number | null>(null);
  const [filter, setFilter]         = useState<string>("all");
  const [loading, setLoading]       = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("communications")
      .select("*, profiles!communications_recipient_id_fkey(codename)")
      .eq("profile_id", profileId)
      .order("timestamp", { ascending: false })
      .limit(30)
      .then(({ data }) => { if (data) setComms(data as Comm[]); setLoading(false); });
  }, [profileId]);

  const handleDecrypt = (id: number) => {
    setDecrypted(prev => new Set([...prev, id]));
    setTimeout(() => setExpanded(id), 600);
  };

  const types = ["all", ...Array.from(new Set(comms.map(c => c.communication_type)))];
  const filtered = filter === "all" ? comms : comms.filter(c => c.communication_type === filter);

  return (
    <HolographicCard className="flex flex-col h-full">
      {/* Header + filters */}
      <div className="px-4 pt-4 pb-3 border-b space-y-3" style={{ borderColor: "rgba(0,240,255,0.1)" }}>
        <div className="flex items-center justify-between">
          <p className="font-mono text-xs tracking-widest text-surveillance-cyan">INTERCEPTED COMMUNICATIONS</p>
          <span className="font-mono text-xs text-surveillance-cyan/30">{comms.length} RECORDS</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {types.map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className="font-mono text-xs px-2 py-0.5 rounded transition-all duration-150"
              style={{
                fontSize: "9px",
                background: filter === t ? "rgba(0,240,255,0.12)" : "transparent",
                border: `1px solid ${filter === t ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.1)"}`,
                color: filter === t ? "#00f0ff" : "rgba(0,240,255,0.4)",
              }}
            >
              {t.replace(/_/g, " ").toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
          </div>
        ) : (
          filtered.map((comm) => {
            const color = typeColor(comm.communication_type);
            const isDecrypted = decrypted.has(comm.id);
            const isExpanded = expanded === comm.id;
            const time = new Date(comm.timestamp).toLocaleString("en-US", {
              month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
            });

            return (
              <motion.div
                key={comm.id}
                layout
                className="rounded overflow-hidden cursor-pointer"
                style={{ background: `${color}06`, border: `1px solid ${color}20` }}
                onClick={() => setExpanded(isExpanded ? null : comm.id)}
              >
                <div className="flex items-start gap-3 p-3">
                  {/* Type icon */}
                  <span className="font-mono text-base flex-shrink-0 mt-0.5" style={{ color }}>
                    {typeIcon(comm.communication_type)}
                  </span>

                  <div className="flex-1 min-w-0">
                    {/* Meta row */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs font-bold tracking-wider" style={{ color, fontSize: "10px" }}>
                        {comm.communication_type.replace(/_/g, " ").toUpperCase()}
                      </span>
                      <span className="font-mono text-xs text-surveillance-cyan/30" style={{ fontSize: "9px" }}>
                        {comm.direction.toUpperCase()}
                      </span>
                      {comm.profiles?.codename && (
                        <span className="font-mono text-xs text-surveillance-cyan/40" style={{ fontSize: "9px" }}>
                          ↔ {comm.profiles.codename}
                        </span>
                      )}
                      <span className="font-mono text-xs text-surveillance-cyan/25 ml-auto" style={{ fontSize: "9px" }}>
                        {time}
                      </span>
                    </div>

                    {/* Content */}
                    <p className="font-mono text-xs text-surveillance-cyan/60 leading-relaxed">
                      {comm.content_preview}
                    </p>

                    {/* Expanded full content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div
                            className="mt-2 p-2 rounded font-mono text-xs text-surveillance-cyan/50 leading-relaxed"
                            style={{ background: "rgba(0,240,255,0.04)", fontSize: "11px" }}
                          >
                            {isDecrypted ? comm.content_full : (
                              <span className="text-surveillance-cyan/20">
                                {Array.from({ length: 8 }, () =>
                                  Array.from({ length: 32 }, () =>
                                    Math.floor(Math.random() * 16).toString(16)
                                  ).join("")
                                ).join("\n")}
                              </span>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Decrypt button */}
                  {(comm.encryption_status === "encrypted" || comm.encryption_status === "decrypted") && (
                    <div className="flex-shrink-0" onClick={e => e.stopPropagation()}>
                      <DecryptButton onDecrypt={() => handleDecrypt(comm.id)} decrypted={isDecrypted} />
                    </div>
                  )}
                </div>

                {/* Encryption badge */}
                <div
                  className="px-3 pb-2 flex items-center gap-1"
                  style={{ borderTop: `1px solid ${color}10` }}
                >
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "8px",
                      color: comm.encryption_status === "plaintext" ? "#00ff88"
                        : comm.encryption_status === "encrypted" ? "#ff006e"
                        : "#ffbe0b",
                    }}
                  >
                    ● {comm.encryption_status.toUpperCase()}
                  </span>
                  {comm.metadata?.carrier && (
                    <span className="font-mono text-surveillance-cyan/20 ml-2" style={{ fontSize: "8px" }}>
                      VIA {comm.metadata.carrier.toUpperCase()}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </HolographicCard>
  );
}