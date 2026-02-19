"use client";

import { motion } from "framer-motion";
import { ThreatBadge, ThreatGauge } from "../shared/threat-indicator";
import HolographicCard from "../shared/holographic-card";

interface Profile {
  id: string;
  codename: string;
  legal_name: string;
  aliases: string[];
  date_of_birth: string;
  nationality: string;
  occupation: string;
  threat_level: number;
  status: string;
  biometric_hash: string;
  profile_image_url: string;
  metadata: any;
}

const statusColor = (s: string) => ({
  active:     "#00f0ff",
  flagged:    "#ff006e",
  dormant:    "#4a9eff",
  terminated: "#ff0044",
  ghost:      "#ffbe0b",
}[s] ?? "#ffffff");

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between py-1.5 border-b" style={{ borderColor: "rgba(0,240,255,0.06)" }}>
      <span className="font-mono text-surveillance-cyan/40 tracking-wider flex-shrink-0" style={{ fontSize: "10px" }}>
        {label}
      </span>
      <span
        className="font-mono text-xs text-right ml-4"
        style={{ color: highlight ? "#00f0ff" : "rgba(0,240,255,0.7)" }}
      >
        {value}
      </span>
    </div>
  );
}

export default function BiometricPanel({ profile }: { profile: Profile }) {
  const age = profile.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365))
    : "UNKNOWN";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Avatar + threat */}
      <HolographicCard
        glowColor={profile.threat_level >= 4 ? "danger" : profile.threat_level >= 3 ? "amber" : "cyan"}
        className="flex flex-col items-center justify-center p-6 gap-4"
      >
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full overflow-hidden"
            style={{ border: "2px solid rgba(0,240,255,0.3)", boxShadow: "0 0 20px rgba(0,240,255,0.2)" }}
          >
            <img
              src={profile.profile_image_url ?? `https://api.dicebear.com/7.x/identicon/svg?seed=${profile.id}`}
              alt={profile.codename}
              className="w-full h-full object-cover"
              style={{ filter: "hue-rotate(180deg) saturate(0.8)" }}
            />
          </div>
          {/* Status ring */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ border: `2px solid ${statusColor(profile.status)}`, borderRadius: "50%" }}
          />
          {/* Corner scan lines */}
          <div className="absolute -inset-2">
            <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-surveillance-cyan/60" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-surveillance-cyan/60" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-surveillance-cyan/60" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-surveillance-cyan/60" />
          </div>
        </div>

        <div className="text-center">
          <p
            className="font-display font-bold text-xl tracking-widest text-surveillance-cyan"
            style={{ textShadow: "0 0 10px rgba(0,240,255,0.5)" }}
          >
            {profile.codename}
          </p>
          <p className="font-mono text-xs text-surveillance-cyan/50 mt-0.5">{profile.legal_name}</p>
        </div>

        <ThreatGauge level={profile.threat_level} size={100} />

        <span
          className="font-mono text-xs px-3 py-1 rounded tracking-widest uppercase"
          style={{
            color: statusColor(profile.status),
            background: `${statusColor(profile.status)}15`,
            border: `1px solid ${statusColor(profile.status)}40`,
          }}
        >
          {profile.status}
        </span>
      </HolographicCard>

      {/* Identity data */}
      <HolographicCard className="p-5">
        <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-3">
          IDENTITY RECORD
        </p>
        <div className="space-y-0">
          <DataRow label="LEGAL NAME"   value={profile.legal_name ?? "UNKNOWN"} highlight />
          <DataRow label="AGE"          value={`${age} YRS`} />
          <DataRow label="NATIONALITY"  value={profile.nationality ?? "UNKNOWN"} />
          <DataRow label="OCCUPATION"   value={profile.occupation ?? "UNKNOWN"} />
          <DataRow label="ALIASES"      value={profile.aliases?.join(", ") || "NONE"} />
          <DataRow label="THREAT"       value={`LEVEL ${profile.threat_level}`} highlight />
        </div>

        <div className="mt-4">
          <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-2">BIOMETRIC HASH</p>
          <div
            className="rounded p-2 font-mono text-xs text-surveillance-cyan/40 break-all"
            style={{ background: "rgba(0,240,255,0.04)", border: "1px solid rgba(0,240,255,0.08)", fontSize: "9px" }}
          >
            {profile.biometric_hash ?? "PENDING ACQUISITION"}
          </div>
        </div>
      </HolographicCard>

      {/* Physical profile */}
      <HolographicCard className="p-5">
        <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-3">
          PHYSICAL PROFILE
        </p>
        <div className="space-y-0">
          <DataRow label="HEIGHT"     value={profile.metadata?.height_cm ? `${profile.metadata.height_cm} CM` : "UNKNOWN"} />
          <DataRow label="WEIGHT"     value={profile.metadata?.weight_kg ? `${profile.metadata.weight_kg} KG` : "UNKNOWN"} />
          <DataRow label="EYES"       value={(profile.metadata?.eye_color ?? "UNKNOWN").toUpperCase()} />
          <DataRow label="HAIR"       value={(profile.metadata?.hair_color ?? "UNKNOWN").toUpperCase()} />
          <DataRow label="LANGUAGES"  value={profile.metadata?.languages?.join(", ") ?? "UNKNOWN"} />
          <DataRow label="HOME CITY"  value={(profile.metadata?.home_city ?? "UNKNOWN").toUpperCase()} />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {["ARMED", "DANGEROUS", "MONITORED"].map((tag) => (
            <div
              key={tag}
              className="rounded px-2 py-1 text-center font-mono"
              style={{
                background: "rgba(255,0,110,0.08)",
                border: "1px solid rgba(255,0,110,0.2)",
                color: "#ff006e",
                fontSize: "8px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </HolographicCard>
    </div>
  );
}