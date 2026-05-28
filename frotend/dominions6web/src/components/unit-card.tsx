import React from "react";
import type { Unit } from "../draftTypes/unit";
import { C } from "../draft-shared";
import type { DraftCardType } from "../../types";

type UnitCardProps = {
    unit: Unit;
    selected?: boolean;
    type: DraftCardType;
    onClick?: () => void;
};

const MAGIC_COLORS: Record<string, any> = {
    fire: { bg: "#2a0d06", text: "#e87050", border: "#5a1a0a" },
    air: { bg: "#091420", text: "#5ab0e0", border: "#1a3a5a" },
    water: { bg: "#06101a", text: "#40a0d0", border: "#0a2a40" },
    earth: { bg: "#12100a", text: "#a08040", border: "#3a2e14" },
    astral: { bg: "#14082a", text: "#b070e0", border: "#3a1a6a" },
    death: { bg: "#100a14", text: "#9060b0", border: "#301840" },
    nature: { bg: "#0a1408", text: "#60b040", border: "#1a3a10" },
    glamour: { bg: "#1a0814", text: "#e060a0", border: "#4a1a30" },
    blood: { bg: "#1a0606", text: "#c03030", border: "#4a1010" },
    holy: { bg: "#1a1806", text: "#e0c040", border: "#4a3c0a" },
    rand: { bg: "#fae41d", text: "#000000", border: "#bb9716", }
} as any;

const MAGIC_LABELS: Record<string, string> = {
    fire: "🔥", air: "💨", water: "💧", earth: "⛰️",
    astral: "⭐", death: "💀", nature: "🌿", glamour: "✨", blood: "🩸",
    rand: "❓"
};

const toCorrectId = (cardId: number) =>
    "0".repeat(4 - cardId.toString().length) + cardId;

const getCardImage = (cardId: number): string =>
    `https://larzm42.github.io/dom6inspector/images/sprites/${toCorrectId(cardId)}_1.png`;

// ── Inline styles ────────────────────────────────────────────────────────────

const s = {
    root: {
        fontFamily: "'Crimson Pro', 'Georgia', serif",
        width: "280px",
        background: "#0e0c0a",
        border: "1px solid #3d2e1a",
        borderRadius: "4px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "transform 0.15s, box-shadow 0.15s",
        textAlign: "left" as const,
        display: "block",
        padding: 0,
        borderRight: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
    } as React.CSSProperties,

    portrait: {
        position: "relative" as const,
        height: "200px",
        background: "radial-gradient(ellipse at 50% 60%, #2a1c08 0%, #0a0705 70%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        borderBottom: "1px solid #3d2e1a",
    } as React.CSSProperties,

    sprite: {
        position: "relative" as const,
        zIndex: 1,
        imageRendering: "pixelated" as const,
        width: "100px",
        height: "100px",
        objectFit: "contain" as const,
        filter: "drop-shadow(0 4px 20px rgba(200,140,30,0.3))",
    } as React.CSSProperties,

    idBadge: {
        position: "absolute" as const,
        top: "10px",
        right: "12px",
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "10px",
        color: "#6b5020",
        letterSpacing: "0.08em",
        zIndex: 2,
    } as React.CSSProperties,

    nameBlock: {
        padding: "12px 16px 10px",
        borderBottom: "1px solid #221a0d",
        background: "#100e0b",
    } as React.CSSProperties,

    name: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "16px",
        fontWeight: 700,
        color: "#d4a847",
        letterSpacing: "0.04em",
        lineHeight: 1.2,
        margin: "0 0 6px",
    } as React.CSSProperties,

    badges: {
        display: "flex",
        gap: "6px",
        flexWrap: "wrap" as const,
    } as React.CSSProperties,

    badgeCommander: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        padding: "2px 8px",
        borderRadius: "2px",
        textTransform: "uppercase" as const,
        background: "#1e1a0f",
        color: "#c49a28",
        border: "1px solid #3d2e1a",
    } as React.CSSProperties,
    heroBadge: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        padding: "2px 8px",
        borderRadius: "2px",
        textTransform: "uppercase" as const,
        background: "#1e1a0f",
        color: "#af1010bd",
        border: "1px solid #3d2e1a",
    } as React.CSSProperties,

    badgeCapital: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "9px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        padding: "2px 8px",
        borderRadius: "2px",
        textTransform: "uppercase" as const,
        background: "#1a0f0f",
        color: "#c43828",
        border: "1px solid #3d1a1a",
    } as React.CSSProperties,

    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1px",
        background: "#1e1608",
    } as React.CSSProperties,

    stat: {
        background: "#120f0a",
        padding: "8px 4px 6px",
        textAlign: "center" as const,
    } as React.CSSProperties,

    statLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.12em",
        color: "#5a4520",
        textTransform: "uppercase" as const,
        marginBottom: "3px",
    } as React.CSSProperties,

    statVal: {
        fontSize: "17px",
        fontWeight: 600,
        color: "#c8a84a",
        lineHeight: 1,
    } as React.CSSProperties,

    statValDim: {
        fontSize: "17px",
        fontWeight: 600,
        color: "#3a2e18",
        lineHeight: 1,
    } as React.CSSProperties,

    section: {
        padding: "8px 14px",
        borderTop: "1px solid #1e1608",
    } as React.CSSProperties,

    sectionLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.15em",
        color: "#4a3818",
        textTransform: "uppercase" as const,
        marginBottom: "6px",
    } as React.CSSProperties,

    pills: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "5px",
    } as React.CSSProperties,

    trait: {
        fontSize: "11px",
        color: "#7a5c28",
        background: "#16110a",
        border: "1px solid #2a1e0e",
        borderRadius: "2px",
        padding: "2px 7px",
        fontStyle: "italic" as const,
    } as React.CSSProperties,

    divider: {
        height: "1px",
        background: "linear-gradient(90deg, transparent, #3d2e1a 30%, #3d2e1a 70%, transparent)",
    } as React.CSSProperties,

    footer: {
        display: "flex",
        background: "#0e0c09",
        borderTop: "1px solid #1e1608",
    } as React.CSSProperties,

    cost: {
        flex: 1,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
    } as React.CSSProperties,

    costBorder: {
        flex: 1,
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        borderLeft: "1px solid #1e1608",
    } as React.CSSProperties,

    costLabel: {
        fontFamily: "'Cinzel', 'Georgia', serif",
        fontSize: "8px",
        letterSpacing: "0.12em",
        color: "#4a3818",
        textTransform: "uppercase" as const,
    } as React.CSSProperties,
};

// ── Corner filigree ──────────────────────────────────────────────────────────

function CornerFiligree() {
    const base: React.CSSProperties = {
        position: "absolute",
        width: "28px",
        height: "28px",
        borderColor: "#8b6a2e",
        borderStyle: "solid",
        opacity: 0.6,
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

function Stat({ label, value }: { label: string; value?: number }) {
    const empty = value === undefined || value === null;
    return (
        <div style={s.stat}>
            <div style={s.statLabel}>{label}</div>
            <div style={empty ? s.statValDim : s.statVal}>{empty ? "—" : value}</div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export default function UnitCard({ unit, selected, type, onClick }: UnitCardProps) {
    const magicEntries = Object.entries(unit.magicPaths || {}).filter(
        ([, v]) => v && v > 0
    );
    if (unit.randomMagicPaths && unit.randomMagicPaths.length >= 0) {
        let maxRandom = 0;
        unit.randomMagicPaths.forEach((rm) => {
            maxRandom = Math.max(rm.link, maxRandom);
        })
        if (maxRandom > 0) {
            magicEntries.push(["rand", maxRandom]);
        }
    }

    const cardStyle: React.CSSProperties = {
        ...s.root,
        border: selected
            ? "3px solid #1a9a2d"
            : "1px solid #1e2d3a",
        boxShadow: selected
            ? "0 0 24px rgba(26,106,154,0.2)"
            : "none",
    };

    return (
        <button style={cardStyle} onClick={onClick}>

            {/* Portrait */}
            <div style={s.portrait}>
                <CornerFiligree />
                <img
                    src={getCardImage(unit.id)}
                    alt={unit.name}
                    style={s.sprite}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div style={s.idBadge}>#{unit.id}</div>
            </div>

            {/* Name + badges */}
            <div style={s.nameBlock}>
                <div style={s.name}>{unit.name}</div>
                <div style={s.badges}>
                    {unit.commander && (
                        <span style={s.badgeCommander}>Commander</span>
                    )}
                    {type === "hero" && (
                            <span style={s.heroBadge}>Hero</span>
                        )
                    }
                    {unit.pretender && (
                        <span style={s.badgeCommander}>Pretender</span>
                    )}
                    {(unit.commander || unit.pretender) && unit.leader != undefined && unit.leader != 0 && (
                        <span style={s.badgeCommander}>leader ship: {unit.leader}</span>
                    )}
                    {(unit.commander || unit.pretender) && unit.magicleader != undefined && unit.magicleader != 0 && (
                        <span style={s.badgeCommander}>magic leader ship: {unit.magicleader}</span>
                    )}
                    {(unit.commander || unit.pretender) && unit.undeadleader != undefined && unit.undeadleader && unit.undeadleader != 0 && (
                        <span style={s.badgeCommander}>undead leader ship: {unit.undeadleader}</span>
                    )}
                    {unit.research != undefined && unit.research != 0 && (
                        <span style={s.badgeCommander}>research: {unit.research}</span>
                    )}
                    {unit.capitalOnly && (
                        <span style={s.badgeCapital}>Capital Only</span>
                    )}
                     {type==="pretender" && unit.startdom && (
                        <span style={s.badgeCapital}>dom strength: {unit.startdom}</span>
                    )}
                </div>
            </div>

            {/* Stats grid */}
            <div style={s.statsGrid}>
                <Stat label="HP" value={unit.hp} />
                <Stat label="Prot" value={unit.prot} />
                <Stat label="STR" value={unit.str} />
                <Stat label="ATT" value={unit.att} />
                <Stat label="DEF" value={unit.def} />
                <Stat label="MR" value={unit.mr} />
                <Stat label="MOR" value={unit.mor} />
                <Stat label="Map" value={unit.mapmove} />
                <Stat label="AP" value={unit.ap} />
            </div>

            {/* Magic */}
            {magicEntries.length > 0 && (
                <div style={s.section}>
                    <div style={s.sectionLabel}>Magic</div>
                    <div style={s.pills}>
                        {magicEntries.map(([path, level]) => {
                            const colors = MAGIC_COLORS[path] ?? { bg: "#1a1a1a", text: "#aaa", border: "#333" };
                            return (
                                <span
                                    key={path}
                                    style={{
                                        fontFamily: "'Cinzel', 'Georgia', serif",
                                        fontSize: "10px",
                                        fontWeight: 700,
                                        padding: "3px 9px",
                                        borderRadius: "2px",
                                        letterSpacing: "0.08em",
                                        background: colors.bg,
                                        color: colors.text,
                                        border: `1px solid ${colors.border}`,
                                    }}
                                >
                                    {MAGIC_LABELS[path] ?? path[0].toUpperCase()}{level}
                                </span>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Traits */}
            {unit.keywords?.length > 0 && (
                <div style={s.section}>
                    <div style={s.sectionLabel}>Traits</div>
                    <div style={s.pills}>
                        {unit.keywords.map((kw) => (
                            <span key={kw} style={s.trait}>{kw}</span>
                        ))}
                    </div>
                </div>
            )}

            <div style={s.divider} />

            {/* Footer */}

            {type != "hero" && unit.gold && unit.calculatedResources && (<div style={s.footer}>
                <div style={s.cost}>
                    <span style={{ fontSize: "16px" }}>🪙</span>
                    <div>
                        <div style={s.costLabel}>Gold</div>
                        <div style={{ fontSize: "16px", fontWeight: 600, color: "#d4a847", lineHeight: 1 }}>
                            {unit.gold}
                        </div>
                    </div>
                </div>
                <div style={s.costBorder}>
                    <span style={{ fontSize: "16px" }}>⚒️</span>
                    <div>
                        <div style={s.costLabel}>Resources</div>
                        <div style={{ fontSize: "16px", fontWeight: 600, color: "#7ab8c8", lineHeight: 1 }}>
                            {unit.calculatedResources}
                        </div>
                    </div>
                </div>
            </div>)}

        </button>
    );
}