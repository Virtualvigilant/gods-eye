"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import HolographicCard from "@/components/gods-eye/shared/holographic-card";
import { ThreatBadge } from "@/components/gods-eye/shared/threat-indicator";

interface Profile {
  id: string;
  codename: string;
  legal_name: string;
  threat_level: number;
  status: string;
  nationality: string;
  occupation: string;
  metadata: any;
}

const statusColor = (s: string) => ({
  active:     "#00f0ff",
  flagged:    "#ff006e",
  dormant:    "#4a9eff",
  terminated: "#ff0044",
  ghost:      "#ffbe0b",
}[s] ?? "#ffffff");

const SAVED_TEMPLATES = [
  { name: "CRITICAL THREATS",    filters: { threat_min: 4, status: "active"   } },
  { name: "FLAGGED TARGETS",     filters: { threat_min: 1, status: "flagged"  } },
  { name: "GHOST OPERATIVES",    filters: { threat_min: 1, status: "ghost"    } },
  { name: "DORMANT ASSETS",      filters: { threat_min: 1, status: "dormant"  } },
];

// ── Result card ───────────────────────────────────────────────────────────────
function ResultCard({ profile, index }: { profile: Profile; index: number }) {
  const color = statusColor(profile.status);
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link href={`/target/${profile.id}`}>
        <div
          className="rounded p-4 cursor-pointer group transition-all duration-150 hover:scale-[1.01]"
          style={{
            background: "rgba(10,15,28,0.8)",
            border: `1px solid rgba(0,240,255,0.12)`,
            boxShadow: "0 0 0 rgba(0,240,255,0)",
          }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.3)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(0,240,255,0.12)")}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Left */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <span className="font-display font-bold text-sm text-surveillance-cyan group-hover:text-white transition-colors tracking-widest">
                  {profile.codename}
                </span>
                <ThreatBadge level={profile.threat_level} />
                <span
                  className="font-mono text-xs px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ color, background: `${color}15`, border: `1px solid ${color}30`, fontSize: "9px" }}
                >
                  {profile.status}
                </span>
              </div>
              <p className="font-mono text-xs text-surveillance-cyan/50">{profile.legal_name}</p>
              <p className="font-mono text-surveillance-cyan/30 mt-1" style={{ fontSize: "10px" }}>
                {profile.occupation} • {profile.nationality} • {profile.metadata?.home_city ?? "UNKNOWN"}
              </p>
            </div>

            {/* Right */}
            <div className="flex-shrink-0 text-right">
              <p className="font-mono text-surveillance-cyan/20 group-hover:text-surveillance-cyan/50 transition-colors" style={{ fontSize: "10px" }}>
                VIEW PROFILE →
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SearchPage() {
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState<Profile[]>([]);
  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [threatMin, setThreatMin] = useState(1);
  const [statusFilter, setStatus] = useState("all");
  const [totalCount, setTotal]    = useState(0);
  const supabase = createClient();

  // Debounced search
  const runSearch = useCallback(async (q: string, tMin: number, status: string) => {
    setLoading(true);
    setSearched(true);

    let req = supabase
      .from("profiles")
      .select("id,codename,legal_name,threat_level,status,nationality,occupation,metadata")
      .gte("threat_level", tMin)
      .order("threat_level", { ascending: false })
      .limit(50);

    if (q.trim()) {
      req = req.or(`codename.ilike.%${q}%,legal_name.ilike.%${q}%,occupation.ilike.%${q}%`);
    }
    if (status !== "all") {
      req = req.eq("status", status);
    }

    const { data, count } = await req;
    setResults((data as Profile[]) ?? []);
    setTotal(count ?? data?.length ?? 0);
    setLoading(false);
  }, []);

  // Auto-search on filter change
  useEffect(() => {
    const t = setTimeout(() => runSearch(query, threatMin, statusFilter), 300);
    return () => clearTimeout(t);
  }, [query, threatMin, statusFilter]);

  // Initial load
  useEffect(() => { runSearch("", 1, "all"); }, []);

  const applyTemplate = (t: typeof SAVED_TEMPLATES[0]) => {
    setThreatMin(t.filters.threat_min);
    setStatus(t.filters.status ?? "all");
    setQuery("");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="SEARCH" subtitle="Target Query System" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Search bar ── */}
        <HolographicCard className="p-4" animate>
          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1">
              {/* Search icon */}
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                viewBox="0 0 24 24" fill="none" stroke="rgba(0,240,255,0.4)" strokeWidth={1.5}
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="16.5" y1="16.5" x2="22" y2="22" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="SEARCH BY CODENAME, IDENTITY, OCCUPATION..."
                className="w-full pl-10 pr-4 py-3 rounded font-mono text-sm text-surveillance-cyan placeholder-surveillance-cyan/20 outline-none transition-all duration-200"
                style={{
                  background: "rgba(5,8,16,0.8)",
                  border: "1px solid rgba(0,240,255,0.2)",
                  boxShadow: query ? "0 0 12px rgba(0,240,255,0.08)" : "none",
                }}
              />
              {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-4 flex-wrap">
            {/* Threat level */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-surveillance-cyan/40 tracking-widest" style={{ fontSize: "9px" }}>
                MIN THREAT
              </span>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(l => (
                  <button
                    key={l}
                    onClick={() => setThreatMin(l)}
                    className="w-6 h-6 rounded font-mono text-xs font-bold transition-all duration-100"
                    style={{
                      background: threatMin <= l ? `${["#00ff88","#4a9eff","#ffbe0b","#ff6600","#ff0044"][l-1]}20` : "rgba(0,240,255,0.04)",
                      border: `1px solid ${threatMin === l ? ["#00ff88","#4a9eff","#ffbe0b","#ff6600","#ff0044"][l-1] : "rgba(0,240,255,0.1)"}`,
                      color: ["#00ff88","#4a9eff","#ffbe0b","#ff6600","#ff0044"][l-1],
                      fontSize: "9px",
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-px h-4 bg-surveillance-cyan/10" />

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-surveillance-cyan/40 tracking-widest" style={{ fontSize: "9px" }}>STATUS</span>
              <div className="flex gap-1 flex-wrap">
                {["all","active","flagged","dormant","ghost","terminated"].map(s => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className="px-2 py-0.5 rounded font-mono transition-all duration-100"
                    style={{
                      fontSize: "9px",
                      background: statusFilter === s ? "rgba(0,240,255,0.1)" : "transparent",
                      border: `1px solid ${statusFilter === s ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.1)"}`,
                      color: statusFilter === s ? "#00f0ff" : "rgba(0,240,255,0.35)",
                    }}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </HolographicCard>

        {/* ── Saved templates ── */}
        <div className="flex gap-2 flex-wrap">
          <span className="font-mono text-surveillance-cyan/30 tracking-widest self-center" style={{ fontSize: "9px" }}>
            TEMPLATES:
          </span>
          {SAVED_TEMPLATES.map(t => (
            <button
              key={t.name}
              onClick={() => applyTemplate(t)}
              className="px-3 py-1 rounded font-mono transition-all duration-150 hover:bg-surveillance-cyan/10"
              style={{
                fontSize: "9px",
                background: "rgba(0,240,255,0.04)",
                border: "1px solid rgba(0,240,255,0.15)",
                color: "rgba(0,240,255,0.5)",
              }}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* ── Results ── */}
        <div className="space-y-2">
          {/* Result count */}
          {searched && !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between px-1"
            >
              <span className="font-mono text-surveillance-cyan/40 tracking-wider" style={{ fontSize: "10px" }}>
                {results.length === 0
                  ? "NO TARGETS FOUND"
                  : `${results.length} TARGET${results.length !== 1 ? "S" : ""} ACQUIRED`}
              </span>
              {results.length > 0 && (
                <span className="font-mono text-surveillance-cyan/20" style={{ fontSize: "9px" }}>
                  SORTED BY THREAT LEVEL
                </span>
              )}
            </motion.div>
          )}

          <AnimatePresence>
            {results.length === 0 && searched && !loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-3"
              >
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ border: "1px solid rgba(0,240,255,0.1)" }}
                >
                  <span className="text-surveillance-cyan/20 text-xl">◌</span>
                </div>
                <p className="font-mono text-surveillance-cyan/30 text-xs tracking-widest">
                  NO MATCHING TARGETS IN DATABASE
                </p>
                <button
                  onClick={() => { setQuery(""); setThreatMin(1); setStatus("all"); }}
                  className="font-mono text-xs text-surveillance-cyan/40 hover:text-surveillance-cyan transition-colors"
                  style={{ fontSize: "9px" }}
                >
                  CLEAR FILTERS
                </button>
              </motion.div>
            ) : (
              results.map((profile, i) => (
                <ResultCard key={profile.id} profile={profile} index={i} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}