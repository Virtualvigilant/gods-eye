"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import BiometricPanel from "@/components/gods-eye/target-profile/biometric-panel";
import CommunicationFeed from "@/components/gods-eye/target-profile/communication-feed";
import DeviceGrid from "@/components/gods-eye/target-profile/device-grid";

const TABS = ["OVERVIEW", "COMMUNICATIONS", "DEVICES", "NETWORK"] as const;
type Tab = typeof TABS[number];

export default function TargetProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState<Tab>("OVERVIEW");
  const supabase = createClient();

  useEffect(() => {
    supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        if (error || !data) { router.push("/command"); return; }
        setProfile(data);
        setLoading(false);
      });

    // Realtime updates
    const channel = supabase
      .channel(`profile-${id}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles",
        filter: `id=eq.${id}`,
      }, (payload) => setProfile((prev: any) => ({ ...prev, ...payload.new })))
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <Header title="TARGET PROFILE" subtitle="Loading..." />
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div
            className="w-16 h-16 rounded-full border-2 border-surveillance-cyan/20 border-t-surveillance-cyan animate-spin"
          />
          <p className="font-mono text-xs text-surveillance-cyan/40 tracking-widest animate-pulse">
            ACQUIRING TARGET DATA...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <Header
        title={`TARGET // ${profile.codename}`}
        subtitle={`${profile.legal_name} • THREAT LEVEL ${profile.threat_level}`}
      />

      {/* Back + tabs */}
      <div
        className="flex items-center gap-6 px-4 border-b flex-shrink-0"
        style={{ background: "rgba(10,15,28,0.8)", borderColor: "rgba(0,240,255,0.08)" }}
      >
        {/* Back button */}
        <button
          onClick={() => router.push("/command")}
          className="font-mono text-xs text-surveillance-cyan/40 hover:text-surveillance-cyan transition-colors py-3"
          style={{ fontSize: "10px" }}
        >
          ← COMMAND
        </button>

        <div className="w-px h-4 bg-surveillance-cyan/10" />

        {/* Tab bar */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative px-4 py-3 font-mono text-xs tracking-widest transition-colors duration-150"
              style={{ color: tab === t ? "#00f0ff" : "rgba(0,240,255,0.3)" }}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ background: "#00f0ff", boxShadow: "0 0 8px #00f0ff" }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {tab === "OVERVIEW" && (
              <div className="space-y-4">
                <BiometricPanel profile={profile} />
                <div
                  className="rounded p-4 font-mono text-xs text-surveillance-cyan/40 text-center"
                  style={{ border: "1px dashed rgba(0,240,255,0.1)" }}
                >
                  Location timeline coming in Chunk 9 — Map integration
                </div>
              </div>
            )}

            {tab === "COMMUNICATIONS" && (
              <div className="h-full min-h-96">
                <CommunicationFeed profileId={id} />
              </div>
            )}

            {tab === "DEVICES" && (
              <DeviceGrid profileId={id} />
            )}

            {tab === "NETWORK" && (
              <div
                className="rounded p-4 font-mono text-xs text-surveillance-cyan/40 text-center"
                style={{ border: "1px dashed rgba(0,240,255,0.1)" }}
              >
                Network graph coming in Chunk 10
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}