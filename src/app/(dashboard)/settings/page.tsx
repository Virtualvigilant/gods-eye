"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/header";
import HolographicCard from "@/components/gods-eye/shared/holographic-card";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-all duration-200 flex-shrink-0"
      style={{
        background: value ? "rgba(0,240,255,0.2)" : "rgba(255,255,255,0.05)",
        border: `1px solid ${value ? "rgba(0,240,255,0.5)" : "rgba(255,255,255,0.1)"}`,
        boxShadow: value ? "0 0 8px rgba(0,240,255,0.2)" : "none",
      }}
    >
      <motion.div
        animate={{ x: value ? 20 : 2 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="absolute top-0.5 w-4 h-4 rounded-full"
        style={{ background: value ? "#00f0ff" : "rgba(255,255,255,0.2)" }}
      />
    </button>
  );
}

function SettingRow({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b" style={{ borderColor: "rgba(0,240,255,0.06)" }}>
      <div>
        <p className="font-mono text-xs text-surveillance-cyan/70">{label}</p>
        {sublabel && <p className="font-mono text-surveillance-cyan/30 mt-0.5" style={{ fontSize: "9px" }}>{sublabel}</p>}
      </div>
      {children}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <HolographicCard className="p-5" animate>
      <p className="font-mono text-xs tracking-widest text-surveillance-cyan/50 mb-3 pb-2 border-b" style={{ borderColor: "rgba(0,240,255,0.08)" }}>
        {title}
      </p>
      {children}
    </HolographicCard>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    scanlines:        true,
    vignette:         true,
    reducedMotion:    false,
    realtimeUpdates:  true,
    alertSounds:      false,
    huntingMode:      false,
    highContrast:     false,
    dataRefreshRate:  30,
    mapCluster:       true,
    showHeatmap:      false,
    operatorId:       "OPERATOR-01",
    clearanceLevel:   5,
  });

  const set = (key: string, val: any) => setSettings(prev => ({ ...prev, [key]: val }));
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header title="SETTINGS" subtitle="Operator Configuration" />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Operator profile */}
        <Section title="OPERATOR PROFILE">
          <SettingRow label="OPERATOR ID" sublabel="Your unique system identifier">
            <input
              value={settings.operatorId}
              onChange={e => set("operatorId", e.target.value)}
              className="font-mono text-xs text-surveillance-cyan bg-transparent outline-none text-right"
              style={{ border: "none", width: "140px" }}
            />
          </SettingRow>
          <SettingRow label="CLEARANCE LEVEL" sublabel="Current access authorization">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(l => (
                <button
                  key={l}
                  onClick={() => set("clearanceLevel", l)}
                  className="w-6 h-6 rounded font-mono text-xs transition-all duration-100"
                  style={{
                    fontSize: "9px",
                    background: settings.clearanceLevel >= l ? "rgba(0,240,255,0.15)" : "rgba(0,240,255,0.04)",
                    border: `1px solid ${settings.clearanceLevel >= l ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.1)"}`,
                    color: settings.clearanceLevel >= l ? "#00f0ff" : "rgba(0,240,255,0.3)",
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </SettingRow>
        </Section>

        {/* Display settings */}
        <Section title="DISPLAY">
          <SettingRow label="SCANLINE OVERLAY" sublabel="CRT-style scanline effect">
            <Toggle value={settings.scanlines} onChange={v => set("scanlines", v)} />
          </SettingRow>
          <SettingRow label="VIGNETTE EFFECT" sublabel="Edge darkening overlay">
            <Toggle value={settings.vignette} onChange={v => set("vignette", v)} />
          </SettingRow>
          <SettingRow label="HIGH CONTRAST MODE" sublabel="Enhanced text legibility">
            <Toggle value={settings.highContrast} onChange={v => set("highContrast", v)} />
          </SettingRow>
          <SettingRow label="REDUCED MOTION" sublabel="Disable non-essential animations">
            <Toggle value={settings.reducedMotion} onChange={v => set("reducedMotion", v)} />
          </SettingRow>
        </Section>

        {/* Data settings */}
        <Section title="DATA & REALTIME">
          <SettingRow label="REALTIME UPDATES" sublabel="Live database subscriptions via Supabase">
            <Toggle value={settings.realtimeUpdates} onChange={v => set("realtimeUpdates", v)} />
          </SettingRow>
          <SettingRow label="DATA REFRESH RATE" sublabel="How often static data refreshes (seconds)">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={5} max={120} step={5}
                value={settings.dataRefreshRate}
                onChange={e => set("dataRefreshRate", parseInt(e.target.value))}
                className="w-24"
                style={{ accentColor: "#00f0ff" }}
              />
              <span className="font-mono text-xs text-surveillance-cyan/60 w-8 text-right">
                {settings.dataRefreshRate}s
              </span>
            </div>
          </SettingRow>
          <SettingRow label="ALERT SOUNDS" sublabel="Audio notification on new alerts">
            <Toggle value={settings.alertSounds} onChange={v => set("alertSounds", v)} />
          </SettingRow>
        </Section>

        {/* Map settings */}
        <Section title="MAP & TRACKING">
          <SettingRow label="TARGET CLUSTERING" sublabel="Group nearby targets when zoomed out">
            <Toggle value={settings.mapCluster} onChange={v => set("mapCluster", v)} />
          </SettingRow>
          <SettingRow label="HEATMAP LAYER" sublabel="Show activity density overlay">
            <Toggle value={settings.showHeatmap} onChange={v => set("showHeatmap", v)} />
          </SettingRow>
          <SettingRow label="HUNTING MODE DEFAULT" sublabel="Enable radar sweep on map load">
            <Toggle value={settings.huntingMode} onChange={v => set("huntingMode", v)} />
          </SettingRow>
        </Section>

        {/* System info */}
        <Section title="SYSTEM INFORMATION">
          {[
            { label: "SYSTEM VERSION",   value: "GOD'S EYE v4.7.1"       },
            { label: "DATABASE",         value: "Supabase PostgreSQL 15"  },
            { label: "FRAMEWORK",        value: "Next.js 14 / App Router" },
            { label: "MAP ENGINE",       value: "Mapbox GL JS v3"         },
            { label: "ENCRYPTION",       value: "AES-256 ACTIVE"          },
            { label: "UPTIME",           value: "99.97%"                  },
          ].map(({ label, value }) => (
            <SettingRow key={label} label={label}>
              <span className="font-mono text-xs text-surveillance-cyan/40">{value}</span>
            </SettingRow>
          ))}
        </Section>

        {/* Save button */}
        <div className="flex justify-end pb-4">
          <motion.button
            onClick={handleSave}
            whileTap={{ scale: 0.97 }}
            className="font-mono text-sm px-8 py-3 rounded tracking-widest transition-all duration-200"
            style={{
              background: saved ? "rgba(0,255,136,0.12)" : "rgba(0,240,255,0.08)",
              border: `1px solid ${saved ? "rgba(0,255,136,0.5)" : "rgba(0,240,255,0.3)"}`,
              color: saved ? "#00ff88" : "#00f0ff",
              boxShadow: saved ? "0 0 16px rgba(0,255,136,0.2)" : "none",
            }}
          >
            {saved ? "✓ CONFIGURATION SAVED" : "SAVE CONFIGURATION"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}