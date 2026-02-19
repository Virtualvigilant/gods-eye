"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import HolographicCard from "../shared/holographic-card";

interface Device {
  id: string;
  device_type: string;
  manufacturer: string;
  model: string;
  os_version: string;
  mac_address: string;
  ip_address: string;
  compromise_status: string;
  is_active: boolean;
  last_seen: string;
  first_seen: string;
}

const compromiseColor = (s: string) => ({
  uncompromised: "#00ff88",
  partial:       "#ffbe0b",
  full:          "#ff0044",
  unknown:       "#888888",
}[s] ?? "#888888");

const deviceIcon = (t: string) => ({
  smartphone: "📱",
  laptop:     "💻",
  vehicle:    "🚗",
  wearable:   "⌚",
  iot:        "📡",
  unknown:    "❓",
}[t] ?? "❓");

function HackProgress({ status, onHack }: { status: string; onHack: () => void }) {
  const [hacking, setHacking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  const handleHack = () => {
    if (hacking || done) return;
    setHacking(true);
    let p = 0;
    const steps = ["SCANNING PORTS", "BYPASSING FIREWALL", "INJECTING PAYLOAD", "EXTRACTING DATA"];
    const t = setInterval(() => {
      p += Math.random() * 12;
      setProgress(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(t);
        setDone(true);
        setHacking(false);
        onHack();
      }
    }, 150);
  };

  if (done) return (
    <span className="font-mono text-xs" style={{ color: "#ff0044", fontSize: "9px" }}>
      ● COMPROMISED
    </span>
  );

  if (hacking) return (
    <div className="space-y-1 w-full">
      <div className="w-full bg-surveillance-deepest rounded-full h-1 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #ff006e, #ff0044)" }}
        />
      </div>
      <span className="font-mono" style={{ fontSize: "8px", color: "#ff006e" }}>
        BREACHING... {Math.floor(progress)}%
      </span>
    </div>
  );

  return (
    <button
      onClick={handleHack}
      disabled={status === "full"}
      className="font-mono text-xs px-2 py-0.5 rounded transition-all duration-150 hover:scale-105"
      style={{
        fontSize: "9px",
        background: "rgba(255,0,110,0.08)",
        border: "1px solid rgba(255,0,110,0.3)",
        color: "#ff006e",
        opacity: status === "full" ? 0.4 : 1,
      }}
    >
      {status === "full" ? "FULL ACCESS" : "INITIATE HACK"}
    </button>
  );
}

export default function DeviceGrid({ profileId }: { profileId: string }) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("devices")
      .select("*")
      .eq("profile_id", profileId)
      .then(({ data }) => { if (data) setDevices(data); setLoading(false); });
  }, [profileId]);

  const handleHack = (id: string) => {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, compromise_status: "full" } : d));
  };

  return (
    <HolographicCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-xs tracking-widest text-surveillance-cyan">
          ASSOCIATED DEVICES
        </p>
        <span className="font-mono text-xs text-surveillance-cyan/30">{devices.length} FOUND</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {devices.map((device, i) => {
            const cColor = compromiseColor(device.compromise_status);
            const lastSeen = new Date(device.last_seen).toLocaleDateString("en-US", {
              month: "short", day: "2-digit", year: "2-digit",
            });
            return (
              <motion.div
                key={device.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.06 }}
                className="rounded p-3 space-y-2"
                style={{
                  background: `${cColor}06`,
                  border: `1px solid ${cColor}25`,
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xl">{deviceIcon(device.device_type)}</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: device.is_active ? "#00ff88" : "#ff0044",
                        boxShadow: device.is_active ? "0 0 4px #00ff88" : "none",
                      }}
                    />
                    <span className="font-mono" style={{ fontSize: "9px", color: device.is_active ? "#00ff88" : "#ff0044" }}>
                      {device.is_active ? "ONLINE" : "OFFLINE"}
                    </span>
                  </div>
                </div>

                {/* Device name */}
                <div>
                  <p className="font-mono text-xs text-surveillance-cyan font-bold">
                    {device.manufacturer} {device.model}
                  </p>
                  <p className="font-mono text-surveillance-cyan/40" style={{ fontSize: "9px" }}>
                    {device.device_type.toUpperCase()} • {device.os_version}
                  </p>
                </div>

                {/* Network info */}
                <div className="space-y-0.5">
                  <p className="font-mono" style={{ fontSize: "9px", color: "rgba(0,240,255,0.4)" }}>
                    MAC: {device.mac_address}
                  </p>
                  <p className="font-mono" style={{ fontSize: "9px", color: "rgba(0,240,255,0.4)" }}>
                    IP: {device.ip_address}
                  </p>
                  <p className="font-mono" style={{ fontSize: "9px", color: "rgba(0,240,255,0.3)" }}>
                    LAST: {lastSeen}
                  </p>
                </div>

                {/* Compromise status + hack button */}
                <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: `${cColor}20` }}>
                  <span className="font-mono" style={{ fontSize: "9px", color: cColor }}>
                    ● {device.compromise_status.toUpperCase()}
                  </span>
                  <HackProgress status={device.compromise_status} onHack={() => handleHack(device.id)} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </HolographicCard>
  );
}