"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ThreatBadge } from "../shared/threat-indicator";
import HolographicCard from "../shared/holographic-card";

interface Profile {
  id: string;
  codename: string;
  legal_name: string;
  threat_level: number;
  status: string;
  nationality: string;
  occupation: string;
  updated_at: string;
}

const statusColor = (s: string) => ({
  active:     "#00f0ff",
  flagged:    "#ff006e",
  dormant:    "#4a9eff",
  terminated: "#ff0044",
  ghost:      "#ffbe0b",
}[s] ?? "#ffffff");

export default function TargetsTable() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading]   = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("id,codename,legal_name,threat_level,status,nationality,occupation,updated_at")
      .order("threat_level", { ascending: false })
      .limit(10)
      .then(({ data }) => { if (data) setProfiles(data); setLoading(false); });

    const channel = supabase
      .channel("profiles-table")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) => {
        setProfiles(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <HolographicCard className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(0,240,255,0.1)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-surveillance-cyan" style={{ boxShadow: "0 0 6px #00f0ff" }} />
          <p className="font-mono text-xs tracking-widest text-surveillance-cyan">ACTIVE TARGETS</p>
        </div>
        <Link href="/search" className="font-mono text-xs text-surveillance-cyan/30 hover:text-surveillance-cyan/60 transition-colors">
          VIEW ALL →
        </Link>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {/* Column headers */}
        <div className="grid px-4 py-2 border-b" style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", borderColor: "rgba(0,240,255,0.06)" }}>
          {["CODENAME","IDENTITY","THREAT","STATUS","ORIGIN"].map(h => (
            <span key={h} className="font-mono text-surveillance-cyan/30 tracking-widest" style={{ fontSize: "9px" }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
          </div>
        ) : (
          profiles.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link href={`/target/${p.id}`}>
                <div
                  className="grid px-4 py-2.5 border-b cursor-pointer group transition-colors duration-100 hover:bg-surveillance-cyan/5"
                  style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr", borderColor: "rgba(0,240,255,0.04)" }}
                >
                  <span className="font-mono text-xs text-surveillance-cyan group-hover:text-white transition-colors truncate">
                    {p.codename}
                  </span>
                  <span className="font-mono text-xs text-surveillance-cyan/50 truncate">
                    {p.legal_name}
                  </span>
                  <span><ThreatBadge level={p.threat_level} /></span>
                  <span
                    className="font-mono text-xs uppercase tracking-wider"
                    style={{ color: statusColor(p.status), fontSize: "10px" }}
                  >
                    {p.status}
                  </span>
                  <span className="font-mono text-xs text-surveillance-cyan/40 uppercase">
                    {p.nationality}
                  </span>
                </div>
              </Link>
            </motion.div>
          ))
        )}
      </div>
    </HolographicCard>
  );
}