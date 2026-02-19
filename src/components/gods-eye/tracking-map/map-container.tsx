"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { createClient } from "@/lib/supabase/client";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!;

interface Target {
    id: string;
    codename: string;
    threat_level: number;
    status: string;
    last_known_location: any;
}

interface LocationPoint {
    profile_id: string;
    coordinates: string;
    timestamp: string;
    source_type: string;
}

const threatColor = (level: number) => ({
    1: "#00ff88",
    2: "#4a9eff",
    3: "#ffbe0b",
    4: "#ff6600",
    5: "#ff0044",
}[level] ?? "#00f0ff");

// Parse IEEE 754 double from hex (little-endian)
function hexToDouble(hex: string): number {
    const bytes = new Uint8Array(8);
    for (let i = 0; i < 8; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }
    return new DataView(bytes.buffer).getFloat64(0, true);
}

// Parse location data — handles EWKB hex, WKT, GeoJSON, and raw objects
function parsePoint(location: any): [number, number] | null {
    if (!location) return null;

    // GeoJSON object: { type: "Point", coordinates: [lng, lat] }
    if (typeof location === "object" && location.coordinates) {
        return [location.coordinates[0], location.coordinates[1]];
    }

    // Object with lng/lat
    if (typeof location === "object") {
        if (location.lng !== undefined && location.lat !== undefined) return [location.lng, location.lat];
        if (location.longitude !== undefined && location.latitude !== undefined) return [location.longitude, location.latitude];
    }

    if (typeof location === "string") {
        // WKT: "POINT(lng lat)"
        const wktMatch = location.match(/POINT\(([^ ]+) ([^ )]+)\)/);
        if (wktMatch) return [parseFloat(wktMatch[1]), parseFloat(wktMatch[2])];

        // EWKB hex from PostGIS (e.g. "0101000020E6100000...")
        if (/^[0-9a-fA-F]{40,}$/.test(location)) {
            let offset = 10; // skip byte order (2) + type (8)
            // Check SRID flag in type bytes
            const typeBytesHex = location.substring(2, 10);
            const typeInt = parseInt(typeBytesHex.match(/.{2}/g)!.reverse().join(""), 16);
            if (typeInt & 0x20000000) offset += 8; // skip SRID
            const lng = hexToDouble(location.substring(offset, offset + 16));
            const lat = hexToDouble(location.substring(offset + 16, offset + 32));
            if (isFinite(lng) && isFinite(lat)) return [lng, lat];
        }
    }

    console.warn("[MapContainer] Unknown location format:", location);
    return null;
}

export default function MapContainer() {
    const mapRef = useRef<mapboxgl.Map | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
    const [targets, setTargets] = useState<Target[]>([]);
    const [selected, setSelected] = useState<Target | null>(null);
    const [huntingMode, setHuntingMode] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const supabase = createClient();

    // ── Init map ────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const map = new mapboxgl.Map({
            container: containerRef.current,
            style: "mapbox://styles/mapbox/dark-v11",
            center: [0, 20],
            zoom: 2,
            projection: { name: "mercator" },
            antialias: true,
        });

        map.on("load", () => {
            // Dark water overlay
            map.setPaintProperty("water", "fill-color", "#050d1a");
            map.setPaintProperty("land", "background-color", "#0a0f1c");

            setLoaded(true);
        });

        mapRef.current = map;
        return () => { map.remove(); mapRef.current = null; };
    }, []);

    // ── Load targets ────────────────────────────────────────────────────────────
    useEffect(() => {
        supabase
            .from("profiles")
            .select("id,codename,threat_level,status,last_known_location")
            .eq("status", "active")
            .then(({ data, error }) => {
                if (error) { console.error("[MapContainer] Supabase error:", error); return; }
                if (data) {
                    console.log("[MapContainer] Loaded targets:", data.length);
                    if (data[0]) console.log("[MapContainer] Sample location:", typeof data[0].last_known_location, data[0].last_known_location);
                    setTargets(data as Target[]);
                }
            });
    }, []);

    // ── Create / update markers ─────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded || !mapRef.current) return;

        targets.forEach((target) => {
            if (!target.last_known_location) return;
            const coords = parsePoint(target.last_known_location);
            if (!coords) return;

            const color = threatColor(target.threat_level);

            // Remove old marker if exists
            if (markersRef.current.has(target.id)) {
                markersRef.current.get(target.id)!.remove();
            }

            // Create marker element
            const el = document.createElement("div");
            el.className = "target-marker";
            el.style.cssText = `
        position: relative;
        width: 24px;
        height: 24px;
        cursor: pointer;
      `;

            el.innerHTML = `
        <div style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          border: 2px solid ${color};
          box-shadow: 0 0 8px ${color}, 0 0 16px ${color}40;
        "></div>
        <div style="
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background: ${color};
          box-shadow: 0 0 6px ${color};
        "></div>
        <div class="pulse-ring" style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1px solid ${color};
          opacity: 0.6;
          animation: pulseRing 2s ease-out infinite;
        "></div>
        <div class="pulse-ring-2" style="
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          border: 1px solid ${color};
          opacity: 0.3;
          animation: pulseRing 2s ease-out infinite 0.5s;
        "></div>
      `;

            el.addEventListener("click", () => setSelected(target));

            const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
                .setLngLat(coords)
                .addTo(mapRef.current!);

            markersRef.current.set(target.id, marker);
        });
    }, [targets, loaded]);

    // ── Realtime location updates ───────────────────────────────────────────────
    useEffect(() => {
        if (!loaded) return;

        const channel = supabase
            .channel("live-locations")
            .on("postgres_changes", {
                event: "INSERT", schema: "public", table: "locations",
            }, (payload) => {
                const loc = payload.new as LocationPoint;
                const coords = parsePoint(loc.coordinates);
                if (!coords) return;
                const marker = markersRef.current.get(loc.profile_id);
                if (marker) {
                    marker.setLngLat(coords);
                }
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [loaded]);

    // ── Fly to selected target ──────────────────────────────────────────────────
    useEffect(() => {
        if (!selected || !mapRef.current) return;
        const coords = parsePoint(selected.last_known_location);
        if (!coords) return;
        mapRef.current.flyTo({ center: coords, zoom: 12, duration: 2000, essential: true });
    }, [selected]);

    // ── Hunting mode: simulate sweep ────────────────────────────────────────────
    const toggleHunting = () => setHuntingMode(h => !h);

    return (
        <div className="relative w-full h-full">
            {/* Pulse ring keyframes injected globally */}
            <style>{`
        @keyframes pulseRing {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>

            {/* Map canvas */}
            <div ref={containerRef} className="w-full h-full" />

            {/* Radar sweep overlay — hunting mode */}
            {huntingMode && (
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ mixBlendMode: "screen" }}
                >
                    <div
                        className="absolute inset-0 animate-radar-sweep"
                        style={{
                            background: "conic-gradient(from 0deg, transparent 300deg, rgba(0,240,255,0.06) 360deg)",
                            transformOrigin: "center",
                        }}
                    />
                </div>
            )}

            {/* Scanline overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,240,255,0.012) 2px, rgba(0,240,255,0.012) 4px)",
                }}
            />

            {/* Top-left: target count */}
            <div
                className="absolute top-4 left-4 rounded px-3 py-2"
                style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(0,240,255,0.2)", backdropFilter: "blur(8px)" }}
            >
                <p className="font-mono text-xs text-surveillance-cyan/50 tracking-widest" style={{ fontSize: "9px" }}>
                    ACTIVE TARGETS
                </p>
                <p className="font-display font-bold text-2xl text-surveillance-cyan" style={{ textShadow: "0 0 10px rgba(0,240,255,0.5)" }}>
                    {targets.length}
                </p>
            </div>

            {/* Top-right: controls */}
            <div
                className="absolute top-4 right-4 flex flex-col gap-2"
                style={{ zIndex: 10 }}
            >
                {/* Hunting mode toggle */}
                <button
                    onClick={toggleHunting}
                    className="flex items-center gap-2 px-3 py-2 rounded font-mono text-xs transition-all duration-200"
                    style={{
                        background: huntingMode ? "rgba(255,0,110,0.15)" : "rgba(5,8,16,0.85)",
                        border: `1px solid ${huntingMode ? "rgba(255,0,110,0.5)" : "rgba(0,240,255,0.2)"}`,
                        color: huntingMode ? "#ff006e" : "rgba(0,240,255,0.6)",
                        backdropFilter: "blur(8px)",
                        boxShadow: huntingMode ? "0 0 16px rgba(255,0,110,0.2)" : "none",
                    }}
                >
                    <span style={{ fontSize: "9px" }}>◉</span>
                    <span style={{ fontSize: "9px", letterSpacing: "0.1em" }}>
                        {huntingMode ? "HUNTING ACTIVE" : "HUNTING MODE"}
                    </span>
                </button>

                {/* Zoom controls */}
                {[
                    { label: "+", action: () => mapRef.current?.zoomIn() },
                    { label: "−", action: () => mapRef.current?.zoomOut() },
                    { label: "⊕", action: () => mapRef.current?.flyTo({ center: [0, 20], zoom: 2, duration: 1500 }) },
                ].map(({ label, action }) => (
                    <button
                        key={label}
                        onClick={action}
                        className="w-8 h-8 rounded font-mono text-sm flex items-center justify-center transition-colors duration-150 hover:bg-surveillance-cyan/10"
                        style={{
                            background: "rgba(5,8,16,0.85)",
                            border: "1px solid rgba(0,240,255,0.2)",
                            color: "rgba(0,240,255,0.6)",
                            backdropFilter: "blur(8px)",
                        }}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Bottom: selected target panel */}
            {selected && (
                <div
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded px-5 py-3 flex items-center gap-6"
                    style={{
                        background: "rgba(5,8,16,0.92)",
                        border: `1px solid ${threatColor(selected.threat_level)}40`,
                        backdropFilter: "blur(12px)",
                        boxShadow: `0 0 20px ${threatColor(selected.threat_level)}20`,
                        minWidth: "360px",
                    }}
                >
                    {/* Pulse dot */}
                    <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ background: threatColor(selected.threat_level), boxShadow: `0 0 8px ${threatColor(selected.threat_level)}` }}
                    />
                    <div className="flex-1">
                        <p className="font-display font-bold text-sm tracking-widest" style={{ color: threatColor(selected.threat_level) }}>
                            {selected.codename}
                        </p>
                        <p className="font-mono text-surveillance-cyan/40" style={{ fontSize: "9px" }}>
                            THREAT LEVEL {selected.threat_level} • {selected.status.toUpperCase()}
                        </p>
                    </div>
                    <Link
                        href={`/target/${selected.id}`}
                        className="font-mono text-xs px-3 py-1 rounded transition-all duration-150 hover:bg-surveillance-cyan/10"
                        style={{ border: "1px solid rgba(0,240,255,0.3)", color: "#00f0ff", fontSize: "9px" }}
                    >
                        PROFILE →
                    </Link>
                    <button
                        onClick={() => setSelected(null)}
                        className="font-mono text-surveillance-cyan/30 hover:text-surveillance-cyan transition-colors"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Threat level legend */}
            <div
                className="absolute bottom-4 left-4 rounded px-3 py-2 space-y-1"
                style={{ background: "rgba(5,8,16,0.85)", border: "1px solid rgba(0,240,255,0.12)", backdropFilter: "blur(8px)" }}
            >
                <p className="font-mono text-surveillance-cyan/30 tracking-widest mb-1" style={{ fontSize: "8px" }}>
                    THREAT LEVEL
                </p>
                {[1, 2, 3, 4, 5].map(l => (
                    <div key={l} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: threatColor(l), boxShadow: `0 0 4px ${threatColor(l)}` }} />
                        <span className="font-mono" style={{ fontSize: "8px", color: "rgba(0,240,255,0.4)" }}>
                            LEVEL {l}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}