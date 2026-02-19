"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/layout/header";
import HolographicCard from "@/components/gods-eye/shared/holographic-card";

// Dynamic import — ForceGraph uses browser APIs
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), { ssr: false });

interface NodeObject {
    id: string;
    codename: string;
    threat_level: number;
    status: string;
    x?: number;
    y?: number;
}

interface LinkObject {
    source: string;
    target: string;
    connection_type: string;
    strength_score: number;
}

const threatColor = (level: number) => ({
    1: "#00ff88",
    2: "#4a9eff",
    3: "#ffbe0b",
    4: "#ff6600",
    5: "#ff0044",
}[level] ?? "#00f0ff");

const linkColor = (type: string) => ({
    family: "#4a9eff",
    colleague: "#00ff88",
    associate: "#00f0ff",
    romantic: "#ff006e",
    adversarial: "#ff0044",
    incidental: "#888888",
    organizational: "#ffbe0b",
    handler: "#ff6600",
}[type] ?? "#444444");

export default function NetworkPage() {
    const [nodes, setNodes] = useState<NodeObject[]>([]);
    const [links, setLinks] = useState<LinkObject[]>([]);
    const [selected, setSelected] = useState<NodeObject | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const graphRef = useRef<any>(null);
    const supabase = createClient();

    useEffect(() => {
        async function fetchGraph() {
            const [profilesRes, connectionsRes] = await Promise.all([
                supabase.from("profiles").select("id,codename,threat_level,status").limit(60),
                supabase.from("network_connections").select("source_id,target_id,connection_type,strength_score,is_active").limit(200),
            ]);

            if (profilesRes.data) {
                setNodes(profilesRes.data.map(p => ({
                    id: p.id,
                    codename: p.codename,
                    threat_level: p.threat_level,
                    status: p.status,
                })));
            }

            if (connectionsRes.data) {
                const filtered = filter === "all"
                    ? connectionsRes.data
                    : connectionsRes.data.filter(c => c.connection_type === filter);

                setLinks(filtered.map(c => ({
                    source: c.source_id,
                    target: c.target_id,
                    connection_type: c.connection_type,
                    strength_score: c.strength_score,
                })));
            }

            setLoading(false);
        }
        fetchGraph();
    }, [filter]);

    const handleNodeClick = useCallback((node: NodeObject) => {
        setSelected(node);
        if (graphRef.current) {
            graphRef.current.centerAt(node.x, node.y, 800);
            graphRef.current.zoom(4, 800);
        }
    }, []);

    const paintNode = useCallback((node: NodeObject, ctx: CanvasRenderingContext2D, globalScale: number) => {
        const color = threatColor(node.threat_level);
        const x = node.x ?? 0;
        const y = node.y ?? 0;
        const r = 6 + node.threat_level * 1.5;
        const isSelected = selected?.id === node.id;

        // Glow
        ctx.shadowColor = color;
        ctx.shadowBlur = isSelected ? 20 : 8;

        // Outer ring
        ctx.beginPath();
        ctx.arc(x, y, r + (isSelected ? 4 : 2), 0, 2 * Math.PI);
        ctx.strokeStyle = color + (isSelected ? "cc" : "44");
        ctx.lineWidth = isSelected ? 2 : 1;
        ctx.stroke();

        // Fill
        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2 * Math.PI);
        ctx.fillStyle = color + "33";
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Center dot
        ctx.beginPath();
        ctx.arc(x, y, r * 0.3, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();

        ctx.shadowBlur = 0;

        // Label (only when zoomed in enough)
        if (globalScale > 1.5 || isSelected) {
            ctx.font = `${Math.max(8, 10 / globalScale)}px JetBrains Mono, monospace`;
            ctx.fillStyle = color;
            ctx.textAlign = "center";
            ctx.textBaseline = "top";
            ctx.fillText(node.codename.split("-")[0], x, y + r + 3);
        }
    }, [selected]);

    const connectionTypes = ["all", "family", "colleague", "associate", "romantic", "adversarial", "organizational", "handler"];

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <Header title="NETWORK GRAPH" subtitle="Relationship Intelligence" />

            <div className="flex-1 relative overflow-hidden">

                {/* Graph canvas */}
                {!loading && (
                    <ForceGraph2D
                        ref={graphRef}
                        graphData={{ nodes, links }}
                        backgroundColor="#050810"
                        nodeCanvasObject={paintNode as any}
                        nodeCanvasObjectMode={() => "replace"}
                        linkColor={(link: any) => linkColor(link.connection_type) + "88"}
                        linkWidth={(link: any) => link.strength_score * 3}
                        linkDirectionalParticles={2}
                        linkDirectionalParticleWidth={(link: any) => link.strength_score * 2}
                        linkDirectionalParticleColor={(link: any) => linkColor(link.connection_type)}
                        onNodeClick={handleNodeClick as any}
                        cooldownTicks={120}
                        d3AlphaDecay={0.02}
                        d3VelocityDecay={0.3}
                        width={typeof window !== "undefined" ? window.innerWidth - 220 : 1200}
                        height={typeof window !== "undefined" ? window.innerHeight - 100 : 800}
                    />
                )}

                {/* Loading */}
                {loading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-2 border-surveillance-cyan/20 border-t-surveillance-cyan rounded-full animate-spin" />
                        <p className="font-mono text-xs text-surveillance-cyan/40 tracking-widest animate-pulse">
                            MAPPING NETWORK CONNECTIONS...
                        </p>
                    </div>
                )}

                {/* Scanline overlay */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,240,255,0.008) 2px,rgba(0,240,255,0.008) 4px)",
                    }}
                />

                {/* Top-left: stats */}
                <div
                    className="absolute top-4 left-4 rounded px-3 py-2 space-y-1"
                    style={{ background: "rgba(5,8,16,0.88)", border: "1px solid rgba(0,240,255,0.15)", backdropFilter: "blur(8px)" }}
                >
                    <p className="font-mono text-surveillance-cyan/40 tracking-widest" style={{ fontSize: "9px" }}>NETWORK STATS</p>
                    <p className="font-mono text-xs text-surveillance-cyan">
                        <span className="text-surveillance-cyan/40" style={{ fontSize: "9px" }}>NODES </span>
                        {nodes.length}
                    </p>
                    <p className="font-mono text-xs text-surveillance-cyan">
                        <span className="text-surveillance-cyan/40" style={{ fontSize: "9px" }}>EDGES </span>
                        {links.length}
                    </p>
                </div>

                {/* Top-right: connection type filter */}
                <div
                    className="absolute top-4 right-4 rounded p-3 space-y-1.5"
                    style={{ background: "rgba(5,8,16,0.88)", border: "1px solid rgba(0,240,255,0.15)", backdropFilter: "blur(8px)", maxWidth: "180px" }}
                >
                    <p className="font-mono text-surveillance-cyan/40 tracking-widest mb-2" style={{ fontSize: "9px" }}>
                        FILTER BY TYPE
                    </p>
                    {connectionTypes.map(t => (
                        <button
                            key={t}
                            onClick={() => setFilter(t)}
                            className="flex items-center gap-2 w-full text-left transition-colors duration-100"
                        >
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ background: t === "all" ? "#00f0ff" : linkColor(t) }}
                            />
                            <span
                                className="font-mono"
                                style={{
                                    fontSize: "9px",
                                    color: filter === t ? "#00f0ff" : "rgba(0,240,255,0.35)",
                                    fontWeight: filter === t ? "bold" : "normal",
                                }}
                            >
                                {t.toUpperCase()}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Bottom: selected node panel */}
                {selected && (
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded px-5 py-3 flex items-center gap-6"
                        style={{
                            background: "rgba(5,8,16,0.92)",
                            border: `1px solid ${threatColor(selected.threat_level)}40`,
                            backdropFilter: "blur(12px)",
                            minWidth: "320px",
                        }}
                    >
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
                            onClick={() => { setSelected(null); graphRef.current?.zoom(2, 600); }}
                            className="font-mono text-surveillance-cyan/30 hover:text-surveillance-cyan transition-colors"
                        >
                            ✕
                        </button>
                    </motion.div>
                )}

                {/* Legend */}
                <div
                    className="absolute bottom-4 left-4 rounded px-3 py-2"
                    style={{ background: "rgba(5,8,16,0.88)", border: "1px solid rgba(0,240,255,0.12)", backdropFilter: "blur(8px)" }}
                >
                    <p className="font-mono text-surveillance-cyan/30 tracking-widest mb-1.5" style={{ fontSize: "8px" }}>
                        NODE SIZE = THREAT LEVEL
                    </p>
                    <p className="font-mono text-surveillance-cyan/30 tracking-widest" style={{ fontSize: "8px" }}>
                        EDGE WIDTH = RELATIONSHIP STRENGTH
                    </p>
                </div>
            </div>
        </div >
    );
}