"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

// ── Boot sequence lines ───────────────────────────────────────────────────────
const BOOT_LINES = [
  "INITIALIZING SECURE CONNECTION...",
  "LOADING ENCRYPTION PROTOCOLS [AES-256]...",
  "ESTABLISHING SATELLITE UPLINK...",
  "CALIBRATING BIOMETRIC SENSORS...",
  "CONNECTING TO GLOBAL NODE NETWORK...",
  "LOADING FACIAL RECOGNITION DATABASE...",
  "SYNCHRONIZING REALTIME FEEDS [247 ACTIVE]...",
  "DECRYPTING SECURE CHANNELS...",
  "SYSTEM INTEGRITY CHECK... PASSED",
  "GOD'S EYE ONLINE.",
];


// ── Typewriter component ──────────────────────────────────────────────────────
function TypewriterLine({ text, onComplete }: { text: string; onComplete?: () => void }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setTimeout(() => onComplete?.(), 120);
      }
    }, 22);
    return () => clearInterval(interval);
  }, [text, onComplete]);

  return (
    <div className="flex items-center gap-2">
      <span className="text-surveillance-cyan opacity-60 text-xs">›</span>
      <span className="font-mono text-xs text-surveillance-cyan">{displayed}</span>
      {displayed.length < text.length && (
        <span className="inline-block w-1.5 h-3 bg-surveillance-cyan animate-pulse" />
      )}
    </div>
  );
}

// ── Radar animation ───────────────────────────────────────────────────────────
function RadarAnimation() {
  return (
    <div className="relative w-32 h-32 mx-auto mb-8">
      {/* Rings */}
      {[1, 0.66, 0.33].map((scale, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-full border border-surveillance-cyan"
          style={{ opacity: 0.15 + i * 0.1, transform: `scale(${scale})`, margin: "auto" }}
        />
      ))}
      {/* Sweep */}
      <div className="absolute inset-0 animate-radar-sweep" style={{ transformOrigin: "center" }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: "conic-gradient(from 0deg, transparent 270deg, rgba(0,240,255,0.4) 360deg)",
          }}
        />
      </div>
      {/* Center dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-surveillance-cyan shadow-glow-cyan" />
      </div>
      {/* Pulse rings */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2 h-2 rounded-full bg-surveillance-cyan animate-pulse-ring" />
      </div>
    </div>
  );
}

// ── Main login page ───────────────────────────────────────────────────────────
type Stage = "boot" | "logo" | "login" | "authenticating" | "granted";

export default function LoginPage() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("boot");
  const [bootLineIndex, setBootLineIndex] = useState(0);
  const [completedLines, setCompletedLines] = useState<string[]>([]);
  const [operatorId, setOperatorId] = useState("");
  const [accessKey, setAccessKey] = useState("");
  const [error, setError] = useState("");
  const [authProgress, setAuthProgress] = useState(0);

  // Advance boot lines
  const handleLineComplete = () => {
    const next = bootLineIndex + 1;
    setCompletedLines(prev => [...prev, BOOT_LINES[bootLineIndex]]);
    if (next >= BOOT_LINES.length) {
      setTimeout(() => setStage("logo"), 400);
    } else {
      setBootLineIndex(next);
    }
  };

  // Logo → login transition
  useEffect(() => {
    if (stage === "logo") {
      setTimeout(() => setStage("login"), 1800);
    }
  }, [stage]);

  // Auth sequence
  const handleLogin = () => {
    if (!operatorId || !accessKey) {
      setError("CREDENTIALS REQUIRED");
      return;
    }
    setError("");
    setStage("authenticating");
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18;
      setAuthProgress(Math.min(progress, 100));
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setStage("granted"), 300);
        setTimeout(() => router.push("/command"), 1500);
      }
    }, 120);
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center p-8">

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Corner decorations */}
      {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map((pos, i) => (
        <div key={i} className={`fixed ${pos} w-8 h-8`}>
          <div
            className="w-full h-full border-surveillance-cyan"
            style={{
              borderWidth: "1px",
              borderStyle: "solid",
              borderColor: "rgba(0,240,255,0.4)",
              clipPath: i === 0 ? "polygon(0 0,40% 0,40% 15%,15% 15%,15% 40%,0 40%)"
                : i === 1 ? "polygon(60% 0,100% 0,100% 40%,85% 40%,85% 15%,60% 15%)"
                : i === 2 ? "polygon(0 60%,15% 60%,15% 85%,40% 85%,40% 100%,0 100%)"
                : "polygon(60% 85%,85% 85%,85% 60%,100% 60%,100% 100%,60% 100%)",
            }}
          />
        </div>
      ))}

      <AnimatePresence mode="wait">

        {/* ── BOOT STAGE ── */}
        {stage === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-surveillance-deep border border-surveillance-cyan/20 rounded p-6 font-mono space-y-1"
              style={{ boxShadow: "0 0 30px rgba(0,240,255,0.05)" }}>
              <div className="text-surveillance-cyan/40 text-xs mb-4">
                GODS_EYE_OS v4.7.1 // SECURE BOOT SEQUENCE
              </div>
              {completedLines.map((line, i) => (
                <div key={i} className="flex items-center gap-2 opacity-50">
                  <span className="text-surveillance-success text-xs">✓</span>
                  <span className="text-xs text-surveillance-cyan">{line}</span>
                </div>
              ))}
              {bootLineIndex < BOOT_LINES.length && (
                <TypewriterLine
                  key={bootLineIndex}
                  text={BOOT_LINES[bootLineIndex]}
                  onComplete={handleLineComplete}
                />
              )}
            </div>
          </motion.div>
        )}

        {/* ── LOGO STAGE ── */}
        {stage === "logo" && (
          <motion.div
            key="logo"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-center"
          >
            <RadarAnimation />
            <motion.h1
              initial={{ opacity: 0, letterSpacing: "0.5em" }}
              animate={{ opacity: 1, letterSpacing: "0.2em" }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-display font-bold text-5xl text-surveillance-cyan tracking-[0.2em]"
              style={{ textShadow: "0 0 20px rgba(0,240,255,0.8), 0 0 60px rgba(0,240,255,0.3)" }}
            >
              GOD&apos;S EYE
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8 }}
              className="font-mono text-xs text-surveillance-cyan mt-2 tracking-widest"
            >
              GLOBAL OBSERVATION & DETECTION SYSTEM
            </motion.p>
          </motion.div>
        )}

        {/* ── LOGIN STAGE ── */}
        {stage === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <RadarAnimation />
              <h1
                className="font-display font-bold text-4xl text-surveillance-cyan tracking-[0.2em]"
                style={{ textShadow: "0 0 20px rgba(0,240,255,0.6)" }}
              >
                GOD&apos;S EYE
              </h1>
              <p className="font-mono text-xs text-surveillance-cyan/50 mt-1 tracking-widest">
                OPERATOR AUTHENTICATION REQUIRED
              </p>
            </div>

            {/* Form */}
            <div
              className="bg-surveillance-deep border rounded p-8 space-y-6"
              style={{
                borderColor: "rgba(0,240,255,0.2)",
                boxShadow: "0 0 40px rgba(0,240,255,0.05), inset 0 0 40px rgba(0,240,255,0.02)",
              }}
            >
              {/* Operator ID */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-surveillance-cyan/60 tracking-widest uppercase">
                  Operator ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={operatorId}
                    onChange={e => setOperatorId(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    placeholder="OPERATOR-XXXX"
                    className="w-full bg-surveillance-deepest border rounded px-4 py-3 font-mono text-sm text-surveillance-cyan placeholder-surveillance-cyan/20 outline-none transition-all duration-200"
                    style={{
                      borderColor: operatorId ? "rgba(0,240,255,0.5)" : "rgba(0,240,255,0.15)",
                      boxShadow: operatorId ? "0 0 10px rgba(0,240,255,0.1)" : "none",
                    }}
                  />
                </div>
              </div>

              {/* Access Key */}
              <div className="space-y-2">
                <label className="font-mono text-xs text-surveillance-cyan/60 tracking-widest uppercase">
                  Access Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={accessKey}
                    onChange={e => setAccessKey(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••••••"
                  className="w-full bg-surveillance-deepest border rounded px-4 py-3 font-mono text-sm text-surveillance-cyan placeholder-surveillance-cyan/20 outline-none transition-all duration-200"
                  style={{
                    borderColor: accessKey ? "rgba(0,240,255,0.5)" : "rgba(0,240,255,0.15)",
                    boxShadow: accessKey ? "0 0 10px rgba(0,240,255,0.1)" : "none",
                  }}
                />
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-xs text-surveillance-danger text-center"
                >
                  ⚠ {error}
                </motion.p>
              )}

              {/* Submit */}
              <button
                onClick={handleLogin}
                className="w-full py-3 font-mono text-sm font-bold tracking-widest rounded transition-all duration-200 relative overflow-hidden group"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(0,240,255,0.4)",
                  color: "#00f0ff",
                }}
              >
                <span className="relative z-10">AUTHENTICATE</span>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(0,240,255,0.08)" }}
                />
              </button>

              <p className="font-mono text-xs text-center text-surveillance-cyan/20">
                UNAUTHORIZED ACCESS IS MONITORED AND PROSECUTED
              </p>
            </div>
          </motion.div>
        )}

        {/* ── AUTHENTICATING STAGE ── */}
        {stage === "authenticating" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-md text-center space-y-6"
          >
            <RadarAnimation />
            <p className="font-mono text-sm text-surveillance-cyan tracking-widest animate-pulse">
              VERIFYING CREDENTIALS...
            </p>
            <div className="w-full bg-surveillance-deep rounded-full h-1 overflow-hidden border border-surveillance-cyan/20">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "linear-gradient(90deg, #00f0ff, #0066ff)", width: `${authProgress}%` }}
              />
            </div>
            <p className="font-mono text-xs text-surveillance-cyan/40">
              {Math.floor(authProgress)}% COMPLETE
            </p>
          </motion.div>
        )}

        {/* ── ACCESS GRANTED STAGE ── */}
        {stage === "granted" && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="text-6xl mb-4"
            >
              <div
                className="w-20 h-20 rounded-full border-2 flex items-center justify-center mx-auto"
                style={{
                  borderColor: "#00ff88",
                  boxShadow: "0 0 30px rgba(0,255,136,0.5)",
                }}
              >
                <span className="text-3xl" style={{ color: "#00ff88" }}>✓</span>
              </div>
            </motion.div>
            <p className="font-mono text-xl text-surveillance-success tracking-widest"
              style={{ textShadow: "0 0 20px rgba(0,255,136,0.8)" }}>
              ACCESS GRANTED
            </p>
            <p className="font-mono text-xs text-surveillance-success/50 mt-2">
              LOADING COMMAND INTERFACE...
            </p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}