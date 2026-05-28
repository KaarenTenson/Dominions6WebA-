import React, { useState, useRef } from "react";
import type { MagicSite, SiteGemEffect } from "../draftTypes/magicSite";
import UnitCard from "./unit-card";
import { C } from "../draft-shared";

// ── Constants ────────────────────────────────────────────────────────────────

const GEM_COLORS: Record<string, { bg: string; text: string; border: string; glow: string }> = {
    fire:    { bg: "#2a0d06", text: "#e87050", border: "#5a1a0a", glow: "rgba(232,112,80,0.25)" },
    air:     { bg: "#091420", text: "#5ab0e0", border: "#1a3a5a", glow: "rgba(90,176,224,0.25)" },
    water:   { bg: "#06101a", text: "#40a0d0", border: "#0a2a40", glow: "rgba(64,160,208,0.25)" },
    earth:   { bg: "#12100a", text: "#a08040", border: "#3a2e14", glow: "rgba(160,128,64,0.25)" },
    astral:  { bg: "#14082a", text: "#b070e0", border: "#3a1a6a", glow: "rgba(176,112,224,0.25)" },
    death:   { bg: "#100a14", text: "#9060b0", border: "#301840", glow: "rgba(144,96,176,0.25)" },
    nature:  { bg: "#0a1408", text: "#60b040", border: "#1a3a10", glow: "rgba(96,176,64,0.25)" },
    glamour: { bg: "#1a0814", text: "#e060a0", border: "#4a1a30", glow: "rgba(224,96,160,0.25)" },
    blood:   { bg: "#1a0606", text: "#c03030", border: "#4a1010", glow: "rgba(192,48,48,0.25)" },
};

const GEM_LABELS: Record<string, string> = {
    fire: "FIRE", air: "AIR", water: "WATER", earth: "EARTH",
    astral: "ASTRAL", death: "DEATH", nature: "NATURE",
    glamour: "GLAMOUR", blood: "BLOOD",
};

const GEM_ICONS: Record<string, string> = {
    fire: "🔥", air: "💨", water: "💧", earth: "⛰️",
    astral: "⭐", death: "💀", nature: "🌿", glamour: "✨", blood: "🩸",
};

const LEVEL_LABELS: Record<number, string> = {
    1: "I", 2: "II", 3: "III", 4: "IV",
};

// ── Image getter (intentionally empty — fill in as needed) ───────────────────

const getSiteImage = (): string | null => {
    return `https://larzm42.github.io/dom6inspector/images/sites/sites_00${Math.floor(Math.random() * 100) + 1}.png`;
};

// ── Inline styles ────────────────────────────────────────────────────────────

const s = {
    root: {
        fontFamily: "'Crimson Pro', 'Georgia', serif",
        width: "280px",
        background: "#0b0d10",
        border: "1px solid #1e2d3a",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        textAlign: "left" as const,
        display: "block",
        padding: 0,
        position: "relative" as const,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
    } as React.CSSProperties,

    portrait: {
        position: "relative" as const,
        height: "160px",
        background: "radial-gradient(ellipse at 50% 70%, #0d1f2e 0%, #060a0e 80%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderBottom: "1px solid #1e2d3a",
    } as React.CSSProperties,

    portraitPlaceholder: {
        fontSize: "52px",
        opacity: 0.35,
        filter: "drop-shadow(0 0 18px rgba(80,160,200,0.4))",
        userSelect: "none" as const,
    } as React.CSSProperties,

    levelBadge: {
        position: "absolute" as const,
        top: "10px",
        left: "12px",
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "11px",
        fontWeight: 700,
        color: "#4a8ab0",
        letterSpacing: "0.1em",
        background: "#07111a",
        border: "1px solid #1a3a52",
        borderRadius: "2px",
        padding: "2px 7px",
        zIndex: 2,
    } as React.CSSProperties,

    idBadge: {
        position: "absolute" as const,
        top: "10px",
        right: "12px",
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "10px",
        color: "#2a5a78",
        letterSpacing: "0.08em",
        zIndex: 2,
    } as React.CSSProperties,

    nameBlock: {
        padding: "12px 16px 10px",
        borderBottom: "1px solid #121c24",
        background: "#0d1218",
    } as React.CSSProperties,

    name: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "15px",
        fontWeight: 700,
        color: "#6ab0d8",
        letterSpacing: "0.04em",
        lineHeight: 1.2,
        margin: "0 0 0",
    } as React.CSSProperties,

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "1px",
        background: "#0d161e",
    } as React.CSSProperties,

    stat: {
        background: "#0a1018",
        padding: "8px 4px 6px",
        textAlign: "center" as const,
    } as React.CSSProperties,

    statLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.12em",
        color: "#2a4a60",
        textTransform: "uppercase" as const,
        marginBottom: "3px",
    } as React.CSSProperties,

    statVal: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#5aа0c8",
        lineHeight: 1,
    } as React.CSSProperties,

    statValDim: {
        fontSize: "15px",
        fontWeight: 600,
        color: "#1a2a38",
        lineHeight: 1,
    } as React.CSSProperties,

    section: {
        padding: "8px 14px",
        borderTop: "1px solid #0f1820",
    } as React.CSSProperties,

    sectionLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.15em",
        color: "#2a4a60",
        textTransform: "uppercase" as const,
        marginBottom: "6px",
    } as React.CSSProperties,

    pills: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "5px",
    } as React.CSSProperties,

    summonRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "12px",
        color: "#4a7a98",
        fontStyle: "italic" as const,
        cursor: "pointer",
    } as React.CSSProperties,

    summonName: {
        color: "#6ab0d8",
        fontStyle: "italic" as const,
        fontSize: "12px",
        textDecoration: "underline",
        textDecorationColor: "#2a4a60",
        textUnderlineOffset: "2px",
    } as React.CSSProperties,

    divider: {
        height: "1px",
        background: "linear-gradient(90deg, transparent, #1e2d3a 30%, #1e2d3a 70%, transparent)",
    } as React.CSSProperties,

    footer: {
        display: "flex",
        background: "#090d10",
        borderTop: "1px solid #0f1820",
    } as React.CSSProperties,

    footerCell: {
        flex: 1,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
    } as React.CSSProperties,

    footerCellBorder: {
        flex: 1,
        padding: "8px 12px",
        display: "flex",
        alignItems: "center",
        gap: "7px",
        borderLeft: "1px solid #0f1820",
    } as React.CSSProperties,

    footerLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.12em",
        color: "#2a4a60",
        textTransform: "uppercase" as const,
    } as React.CSSProperties,

    // Tooltip / unit card popup
    tooltip: {
        position: "fixed" as const,
        zIndex: 9999,
        pointerEvents: "none" as const,
        transition: "opacity 0.15s",
    } as React.CSSProperties,
};

// ── Corner filigree (blue-tinted) ────────────────────────────────────────────

function CornerFiligree() {
    const base: React.CSSProperties = {
        position: "absolute",
        width: "24px",
        height: "24px",
        borderColor: "#2a6080",
        borderStyle: "solid",
        opacity: 0.5,
    };
    return (
        <>
            <div style={{ ...base, top: 8, left: 8, borderWidth: "1px 0 0 1px" }} />
            <div style={{ ...base, top: 8, right: 8, borderWidth: "1px 1px 0 0" }} />
            <div style={{ ...base, bottom: 8, left: 8, borderWidth: "0 0 1px 1px" }} />
            <div style={{ ...base, bottom: 8, right: 8, borderWidth: "0 1px 1px 0" }} />
        </>
    );
}

// ── Stat cell ────────────────────────────────────────────────────────────────

function Stat({ label, value, suffix = "" }: { label: string; value?: number; suffix?: string }) {
    const empty = value === undefined || value === null || value === 0;
    return (
        <div style={s.stat}>
            <div style={s.statLabel}>{label}</div>
            <div style={empty ? s.statValDim : { ...s.statVal, color: "#5aa0c8" }}>
                {empty ? "—" : `${value}${suffix}`}
            </div>
        </div>
    );
}

// ── Gem pill ─────────────────────────────────────────────────────────────────

function GemPill({ effect }: { effect: SiteGemEffect }) {
    const colors = GEM_COLORS[effect.type] ?? { bg: "#111", text: "#aaa", border: "#333", glow: "transparent" };
    return (
        <span
            style={{
                fontFamily: "'Cinzel', 'Georgia', serif",
                fontSize: "10px",
                fontWeight: 700,
                padding: "3px 9px",
                borderRadius: "2px",
                letterSpacing: "0.06em",
                background: colors.bg,
                color: colors.text,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 0 6px ${colors.glow}`,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
            }}
        >
            <span>{GEM_ICONS[effect.type]}</span>
            <span>{GEM_LABELS[effect.type] ?? effect.type}</span>
            <span style={{ opacity: 0.7 }}>×{effect.gemAmount}</span>
        </span>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

type MagicSiteCardProps = {
    site: MagicSite;
    selected?: boolean;
    onClick?: () => void;
};

export default function MagicSiteCard({ site, selected, onClick }: MagicSiteCardProps) {
    const [unitTooltipVisible, setUnitTooltipVisible] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
    const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    const imageUrl = getSiteImage();

    const cardStyle: React.CSSProperties = {
    ...s.root,
    border: selected
        ? "3px solid #1a9a2d"
        : "1px solid #1e2d3a",
    boxShadow: selected
        ? "0 0 24px rgba(26,106,154,0.2)"
        : "none",
};

    const handleSummonMouseEnter = (e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        // Position tooltip to the right of the card, or flip left if near right edge
        const spaceRight = window.innerWidth - rect.right;
        const x = spaceRight > 300 ? rect.right + 12 : rect.left - 292;
        const y = Math.min(rect.top, window.innerHeight - 500);
        setTooltipPos({ x, y });
        tooltipTimeout.current = setTimeout(() => setUnitTooltipVisible(true), 120);
    };

    const handleSummonMouseLeave = () => {
        if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);
        setUnitTooltipVisible(false);
    };

    return (
        <>
            <button style={cardStyle} onClick={onClick}>

                {/* Portrait */}
                <div style={s.portrait}>
                    <CornerFiligree />
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={site.name}
                            style={{
                                position: "relative",
                                zIndex: 1,
                                imageRendering: "pixelated",
                                width: "90px",
                                height: "90px",
                                objectFit: "contain",
                                filter: "drop-shadow(0 4px 20px rgba(60,140,200,0.35))",
                            }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div style={s.portraitPlaceholder}>🏛️</div>
                    )}
                    <div style={s.levelBadge}>LVL {LEVEL_LABELS[site.level]}</div>
                </div>

                {/* Name */}
                <div style={s.nameBlock}>
                    <div style={s.name}>{site.name}</div>
                </div>

                {/* Resource stats */}
                <div style={s.statsGrid}>
                    <Stat label="Gold"     value={site.gold} />
                    <Stat label="Supply"   value={site.supply} />
                    <Stat label="Resource" value={site.resource} />
                    <Stat label="−Unrest"  value={site.decUnrest} />
                </div>

                {/* Gem income */}
                {site.gemEffects && site.gemEffects.length > 0 && (
                    <div style={s.section}>
                        <div style={s.sectionLabel}>Gem Income</div>
                        <div style={s.pills}>
                            {site.gemEffects.map((effect, i) => (
                                <GemPill key={i} effect={effect} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Summon */}
                {site.summonUnit && (
                    <div style={s.section}>
                        <div style={s.sectionLabel}>Summons</div>
                        <div
                            style={s.summonRow}
                            onMouseEnter={handleSummonMouseEnter}
                            onMouseLeave={handleSummonMouseLeave}
                        >
                            <span>⚗️</span>
                            <span style={s.summonName}>{site.summonUnit.name}</span>
                        </div>
                    </div>
                )}

                <div style={s.divider} />

            </button>

            {/* Unit card tooltip on summon hover */}
            {site.summonUnit && unitTooltipVisible && (
                <div
                    style={{
                        ...s.tooltip,
                        left: tooltipPos.x,
                        top: tooltipPos.y,
                        opacity: unitTooltipVisible ? 1 : 0,
                    }}
                >
                    <UnitCard unit={site.summonUnit} type="commander" />
                </div>
            )}
        </>
    );
}