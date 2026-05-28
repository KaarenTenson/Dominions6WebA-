import React, { useMemo } from "react";
import type { DraftCard, DraftedCardChoosingState, StartLocation, User, UserConfirmationState } from "../../types";
import { useDraftStore } from "../draftStore";
import { SERVER_ENDPOINT } from "../constants";
import UnitCard from "../components/unit-card";
import { C, cinzel, crimson, Ornament, CheckIcon, SpinnerIcon, getConfirmedState } from "../draft-shared";
import MagicSiteCard from "./magic-card";

/* -------------------------------------------------------------------------- */
/*  TYPES                                                                      */
/* -------------------------------------------------------------------------- */

type CardSelectionProps = {
    chooseDraftedCards: (card: DraftCard<any>) => void;
    confirmChosenDraftedCards: () => void;
    chosenDraftedCards: DraftedCardChoosingState;
    users: User[];
    confirmedState: UserConfirmationState[];
    chooseHeat: (heat: number) => void;
    chooseStartingLocation: (loc: StartLocation) => void;
};

const LIMITS = { pretender: 4, commanders: 8, units: 8, magicSites: 3, heros:2};

/* -------------------------------------------------------------------------- */
/*  PROGRESS CARD                                                              */
/* -------------------------------------------------------------------------- */

type ProgressCardProps = {
    label: string;
    current: number;
    target: number;
};

function ProgressCard({ label, current, target }: ProgressCardProps) {
    const pct = Math.min(current / target, 1) * 100;
    const complete = current === target;
    const over = current > target;

    return (
        <div style={{
            background: complete ? "#052e16" : over ? "#2a0a0a" : C.surface,
            border: `1px solid ${complete ? "#166534" : over ? "#5a1a1a" : C.border}`,
            borderRadius: "4px",
            padding: "10px 14px",
            position: "relative",
            overflow: "hidden",
            transition: "all 0.2s",
        }}>
            <div style={{ ...cinzel, fontSize: "8px", letterSpacing: "0.12em", textTransform: "uppercase" as const, color: C.muted, marginBottom: "4px" }}>
                {label}
            </div>
            <div>
                <span style={{
                    ...cinzel, fontSize: "20px", fontWeight: 700,
                    color: complete ? "#4ade80" : over ? "#f87171" : C.gold,
                    transition: "color 0.2s",
                }}>
                    {current}
                </span>
                <span style={{ ...cinzel, fontSize: "12px", color: C.muted, marginLeft: "3px" }}>/ {target}</span>
            </div>
            {/* progress bar */}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2px", background: "#1e1608" }}>
                <div style={{
                    position: "absolute", bottom: 0, left: 0, height: "2px",
                    width: `${pct}%`,
                    background: complete ? "#4ade80" : over ? "#f87171" : C.gold,
                    transition: "width 0.3s, background 0.2s",
                }} />
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  SECTION WRAPPER                                                            */
/* -------------------------------------------------------------------------- */

type CardSectionProps = {
    icon: string;
    label: string;
    current: number;
    target: number;
    children: React.ReactNode;
};

function CardSection({ icon, label, current, target, children }: CardSectionProps) {
    const complete = current === target;
    const over = current > target;

    return (
        <div style={{ marginBottom: "20px" }}>
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                borderRadius: "4px 4px 0 0",
            }}>
                <span style={{ fontSize: "13px", color: C.muted }}>{icon}</span>
                <span style={{ ...cinzel, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: C.muted, flex: 1 }}>
                    {label}
                </span>
                <span style={{
                    ...cinzel, fontSize: "10px", letterSpacing: "0.08em",
                    color: complete ? "#4ade80" : over ? "#f87171" : C.goldDim,
                    transition: "color 0.2s",
                }}>
                    {current} / {target} selected
                </span>
            </div>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "0",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: "none",
                borderRadius: "0 0 4px 4px",
                overflow: "hidden",
                alignItems: "start",
            }}>
                {children}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  HEAT SELECTOR                                                              */
/* -------------------------------------------------------------------------- */

type HeatSelectorProps = {
    heat: number;
    onChoose: (heat: number) => void;
};

const HEAT_STEPS = [-3, -2, -1, 0, 1, 2, 3] as const;

function heatColor(h: number): string {
    if (h <= -3) return "#93c5fd"; // icy blue
    if (h === -2) return "#a5d8f7";
    if (h === -1) return "#c4e6f5";
    if (h === 0)  return C.gold;
    if (h === 1)  return "#f5a623";
    if (h === 2)  return "#f07030";
    return "#e03010";            // scorching red
}

function heatLabel(h: number): string {
    const labels: Record<number, string> = {
        [-3]: "Glacial",
        [-2]: "Freezing",
        [-1]: "Cold",
        [0]:  "Temperate",
        [1]:  "Warm",
        [2]:  "Hot",
        [3]:  "Scorching",
    };
    return labels[h] ?? "";
}

function heatGlyph(h: number): string {
    if (h <= -2) return "❄";
    if (h === -1) return "🌬";
    if (h === 0)  return "☀";
    if (h === 1)  return "🌤";
    if (h === 2)  return "🔥";
    return "♨";
}

function HeatSelector({ heat, onChoose }: HeatSelectorProps) {
    return (
        <div style={{ marginBottom: "20px" }}>
            {/* header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                borderRadius: "4px 4px 0 0",
            }}>
                <span style={{ fontSize: "13px", color: C.muted }}>🌡</span>
                <span style={{ ...cinzel, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: C.muted, flex: 1 }}>
                    Province Heat
                </span>
                <span style={{ ...cinzel, fontSize: "10px", letterSpacing: "0.08em", color: heatColor(heat), transition: "color 0.2s" }}>
                    {heatGlyph(heat)} {heatLabel(heat)}
                </span>
            </div>

            {/* body */}
            <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: "none",
                borderRadius: "0 0 4px 4px",
                padding: "16px 18px",
            }}>
                {/* gradient track */}
                <div style={{
                    position: "relative",
                    height: "6px",
                    borderRadius: "3px",
                    background: "linear-gradient(to right, #93c5fd, #c4e6f5, #d4a020, #f07030, #e03010)",
                    marginBottom: "16px",
                    marginTop: "4px",
                }} />

                {/* step buttons */}
                <div style={{ display: "flex", gap: "6px", alignItems: "stretch" }}>
                    {HEAT_STEPS.map((step) => {
                        const active = heat === step;
                        const col = heatColor(step);
                        return (
                            <button
                                key={step}
                                onClick={() => onChoose(step)}
                                title={heatLabel(step)}
                                style={{
                                    flex: 1,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: "5px",
                                    padding: "8px 4px",
                                    borderRadius: "3px",
                                    cursor: "pointer",
                                    background: active ? `${col}18` : "transparent",
                                    border: `1px solid ${active ? col : C.border}`,
                                    transition: "all 0.15s",
                                    outline: "none",
                                }}
                            >
                                <span style={{ fontSize: "14px", lineHeight: 1 }}>{heatGlyph(step)}</span>
                                <span style={{
                                    ...cinzel,
                                    fontSize: "8px",
                                    fontWeight: active ? 700 : 400,
                                    letterSpacing: "0.06em",
                                    color: active ? col : C.muted,
                                    transition: "color 0.15s",
                                    textAlign: "center",
                                    lineHeight: 1.2,
                                }}>
                                    {step > 0 ? `+${step}` : step}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* description */}
                <p style={{ ...crimson, fontSize: "12px", color: C.muted, fontStyle: "italic", margin: "10px 0 0", textAlign: "center" }}>
                    {heat < 0
                        ? `Cold provinces suffer attrition on cold-blooded troops.`
                        : heat > 0
                        ? `Hot provinces suffer attrition on cold-climate troops.`
                        : `Temperate climate — no heat-related attrition.`}
                </p>
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  START LOCATION SELECTOR                                                    */
/* -------------------------------------------------------------------------- */

type StartLocationSelectorProps = {
    startLocation: StartLocation;
    onChoose: (loc: StartLocation) => void;
};

const LOCATIONS: { id: StartLocation; label: string; icon: string; description: string; color: string }[] = [
    {
        id: "land",
        label: "Land",
        icon: "⛰",
        description: "Begin in an inland province. Suited to most armies.",
        color: "#8b7355",
    },
    {
        id: "cave",
        label: "Cave",
        icon: "🕳",
        description: "Rise from the depths. Unlocks subterranean passage.",
        color: "#6a5a8a",
    },
    {
        id: "water",
        label: "Water",
        icon: "🌊",
        description: "Emerge from the sea. Requires amphibious forces.",
        color: "#2d7da8",
    },
];

function StartLocationSelector({ startLocation, onChoose }: StartLocationSelectorProps) {
    const active = LOCATIONS.find((l) => l.id === startLocation);

    return (
        <div style={{ marginBottom: "20px" }}>
            {/* header */}
            <div style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "8px 14px",
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderBottom: "none",
                borderRadius: "4px 4px 0 0",
            }}>
                <span style={{ fontSize: "13px", color: C.muted }}>🗺</span>
                <span style={{ ...cinzel, fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase" as const, color: C.muted, flex: 1 }}>
                    Starting Location
                </span>
                {active && (
                    <span style={{ ...cinzel, fontSize: "10px", letterSpacing: "0.08em", color: active.color, transition: "color 0.2s" }}>
                        {active.icon} {active.label}
                    </span>
                )}
            </div>

            {/* body */}
            <div style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderTop: "none",
                borderRadius: "0 0 4px 4px",
                padding: "14px 18px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "10px",
            }}>
                {LOCATIONS.map((loc) => {
                    const isActive = startLocation === loc.id;
                    return (
                        <button
                            key={loc.id}
                            onClick={() => onChoose(loc.id)}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "8px",
                                padding: "16px 12px",
                                borderRadius: "4px",
                                cursor: "pointer",
                                background: isActive ? `${loc.color}18` : "transparent",
                                border: `1px solid ${isActive ? loc.color : C.border}`,
                                transition: "all 0.15s",
                                outline: "none",
                                position: "relative",
                                overflow: "hidden",
                            }}
                        >
                            {/* active shimmer line */}
                            {isActive && (
                                <div style={{
                                    position: "absolute",
                                    top: 0, left: 0, right: 0,
                                    height: "2px",
                                    background: loc.color,
                                }} />
                            )}
                            <span style={{ fontSize: "22px", lineHeight: 1 }}>{loc.icon}</span>
                            <span style={{
                                ...cinzel,
                                fontSize: "11px",
                                fontWeight: isActive ? 700 : 400,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase" as const,
                                color: isActive ? loc.color : C.muted,
                                transition: "color 0.15s",
                            }}>
                                {loc.label}
                            </span>
                            <span style={{
                                ...crimson,
                                fontSize: "11px",
                                fontStyle: "italic",
                                color: isActive ? `${loc.color}cc` : C.textDim,
                                textAlign: "center",
                                lineHeight: 1.4,
                                transition: "color 0.15s",
                            }}>
                                {loc.description}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

const CardSelection = ({
    chooseDraftedCards,
    confirmChosenDraftedCards,
    chosenDraftedCards,
    users,
    confirmedState,
    chooseHeat,
    chooseStartingLocation,
}: CardSelectionProps) => {
    const { commanders, units, pretenders, magicSites , heros} = useDraftStore();

    const cmdCount = chosenDraftedCards.commanders.length;
    const unitCount = chosenDraftedCards.units.length;
    const heroCount = chosenDraftedCards.heros.length;
    const pretCount = chosenDraftedCards.pretenders.length;
    const siteCount = chosenDraftedCards.magicSites.length;
    const isReady = pretCount === 4 && cmdCount === LIMITS.commanders && unitCount === LIMITS.units;

    const missingParts = useMemo(() => {
        const parts: string[] = [];
        if (pretCount < LIMITS.pretender) parts.push(`${LIMITS.pretender - pretCount} more pretender${LIMITS.pretender - pretCount > 1 ? "s" : ""}`);
        if (cmdCount < LIMITS.commanders) parts.push(`${LIMITS.commanders - cmdCount} more commander${LIMITS.commanders - cmdCount > 1 ? "s" : ""}`);
        if (unitCount < LIMITS.units) parts.push(`${LIMITS.units - unitCount} more unit${LIMITS.units - unitCount > 1 ? "s" : ""}`);
        if (siteCount < LIMITS.magicSites) parts.push(`${LIMITS.magicSites - siteCount} more site${LIMITS.magicSites - siteCount > 1 ? "s" : ""}`);
        if (heroCount < LIMITS.heros) parts.push(`${LIMITS.heros - siteCount} more hero${LIMITS.heros - siteCount > 1 ? "s" : ""}`);
        return parts;
    }, [pretCount, cmdCount, unitCount, siteCount]);

    return (
        <div>
            {/* ── HEADER ────────────────────────────────────────────── */}
            <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: "20px",
                flexWrap: "wrap", gap: "16px",
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                        <h2 style={{ ...cinzel, fontSize: "18px", fontWeight: 700, color: C.gold, margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                            Choose Your Forces
                        </h2>
                        <Ornament />
                    </div>
                    <p style={{ ...crimson, fontSize: "13px", color: C.muted, margin: 0, fontStyle: "italic" }}>
                        Select 1 pretender, {LIMITS.commanders} commanders, and {LIMITS.units} units from your drafted pool
                    </p>
                </div>

                {/* Player confirmation pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {users.map((user) => {
                        const confirmed = getConfirmedState(user.id || "", confirmedState);
                        return (
                            <div key={user.id} style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: confirmed ? "#052e16" : C.surface,
                                border: `1px solid ${confirmed ? "#166534" : C.border}`,
                                borderRadius: "3px", padding: "5px 10px",
                                transition: "all 0.2s",
                            }}>
                                <img
                                    src={user.profilePicId
                                        ? `${SERVER_ENDPOINT}/blob/${user.profilePicId}`
                                        : "https://placehold.co/24x24/0e0c0a/7a5c28?text=?"}
                                    alt={user.username}
                                    style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", border: `1px solid ${confirmed ? "#166534" : C.borderBright}`, display: "block" }}
                                />
                                <div>
                                    <div style={{ ...cinzel, fontSize: "10px", color: C.gold, fontWeight: 600 }}>{user.username}</div>
                                    <div style={{ ...cinzel, fontSize: "8px", letterSpacing: "0.1em", textTransform: "uppercase" as const, color: confirmed ? "#4ade80" : "#d4a020" }}>
                                        {confirmed ? "Confirmed" : "Selecting..."}
                                    </div>
                                </div>
                                <div style={{ color: confirmed ? "#4ade80" : C.textDim }}>
                                    {confirmed ? <CheckIcon /> : <SpinnerIcon />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── PROGRESS TRACKER ──────────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "24px" }}>
                <ProgressCard label="Pretender" current={pretCount} target={LIMITS.pretender} />
                <ProgressCard label="Commanders" current={cmdCount} target={LIMITS.commanders} />
                <ProgressCard label="Units" current={unitCount} target={LIMITS.units} />
                <ProgressCard label="Sites" current={siteCount} target={LIMITS.magicSites} />
                <ProgressCard label="Heros" current={heroCount} target={LIMITS.heros} />
            </div>

            {/* ── HEAT + START LOCATION ─────────────────────────────── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "8px" }}>
                <HeatSelector
                    heat={chosenDraftedCards.heat}
                    onChoose={chooseHeat}
                />
                <StartLocationSelector
                    startLocation={chosenDraftedCards.startLocation}
                    onChoose={chooseStartingLocation}
                />
            </div>

            {/* ── EMPTY STATE ───────────────────────────────────────── */}
            {commanders.length === 0 && units.length === 0 && magicSites.length === 0 && pretenders.length === 0 ? (
                <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    height: "240px", background: C.surface,
                    border: `1px dashed ${C.border}`, borderRadius: "4px", gap: "12px",
                }}>
                    <SpinnerIcon size={28} />
                    <p style={{ ...crimson, color: C.muted, fontSize: "16px", fontStyle: "italic", margin: 0 }}>
                        Waiting for drafted cards...
                    </p>
                </div>
            ) : (
                <>
                    {/* ── PRETENDERS ────────────────────────────────── */}
                    {pretenders.length > 0 && (
                        <CardSection icon="⚡" label="Pretender" current={pretCount} target={4}>
                            {pretenders.map((card) => (
                                <UnitCard
                                    key={card.id}
                                    unit={card.data}
                                    type={card.type}
                                    selected={chosenDraftedCards.pretenders.some((c) => c.id === card.id)}
                                    onClick={() => chooseDraftedCards(card)}
                                />
                            ))}
                        </CardSection>
                    )}

                    {/* ── COMMANDERS ────────────────────────────────── */}
                    {commanders.length > 0 && (
                        <CardSection icon="👑" label="Commanders" current={cmdCount} target={LIMITS.commanders}>
                            {commanders.map((card) => (
                                <UnitCard
                                    key={card.id}
                                    unit={card.data}
                                    type={card.type}
                                    selected={chosenDraftedCards.commanders.some((c) => c.id === card.id)}
                                    onClick={() => chooseDraftedCards(card)}
                                />
                            ))}
                        </CardSection>
                    )}

                    {/* ── UNITS ─────────────────────────────────────── */}
                    {units.length > 0 && (
                        <CardSection icon="⚔" label="Units" current={unitCount} target={LIMITS.units}>
                            {units.map((card) => (
                                <UnitCard
                                    key={card.id}
                                    unit={card.data}
                                    type={card.type}
                                    selected={chosenDraftedCards.units.some((c) => c.id === card.id)}
                                    onClick={() => chooseDraftedCards(card)}
                                />
                            ))}
                        </CardSection>
                    )}
                      {/* ── HEROS ─────────────────────────────────────── */}
                    {heros.length > 0 && (
                        <CardSection icon="⚔" label="Heros" current={heroCount} target={LIMITS.heros}>
                            {heros.map((card) => (
                                <UnitCard
                                    key={card.id}
                                    unit={card.data}
                                    type={card.type}
                                    selected={chosenDraftedCards.heros.some((c) => c.id === card.id)}
                                    onClick={() => chooseDraftedCards(card)}
                                />
                            ))}
                        </CardSection>
                    )}

                    {/* ── MAGIC SITES ───────────────────────────────── */}
                    {magicSites.length > 0 && (
                        <CardSection icon="✦" label="Sites" current={siteCount} target={LIMITS.magicSites}>
                            {magicSites.map((card) => (
                                <MagicSiteCard
                                    key={card.id}
                                    site={card.data}
                                    selected={chosenDraftedCards.magicSites.some((c) => c.id === card.id)}
                                    onClick={() => chooseDraftedCards(card)}
                                />
                            ))}
                        </CardSection>
                    )}

                    {/* ── CONFIRM BAR ───────────────────────────────── */}
                    <div style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: "12px",
                        padding: "14px 18px",
                        background: C.surface,
                        border: `1px solid ${isReady ? "#166534" : C.border}`,
                        borderRadius: "4px",
                        transition: "border-color 0.2s",
                    }}>
                        <p style={{ ...crimson, fontSize: "13px", color: isReady ? "#4ade80" : C.muted, fontStyle: "italic", margin: 0 }}>
                            {isReady
                                ? "All forces assembled — ready to confirm."
                                : `Still needed: ${missingParts.join(", ")}.`}
                        </p>
                        <button
                            onClick={confirmChosenDraftedCards}
                            disabled={!isReady}
                            style={{
                                ...cinzel, fontSize: "10px", letterSpacing: "0.15em",
                                textTransform: "uppercase" as const, fontWeight: 700,
                                padding: "9px 24px", borderRadius: "3px", cursor: isReady ? "pointer" : "not-allowed",
                                background: isReady ? "#052e16" : "#120f0a",
                                color: isReady ? "#4ade80" : C.muted,
                                border: `1px solid ${isReady ? "#166534" : C.border}`,
                                transition: "all 0.2s",
                                opacity: isReady ? 1 : 0.5,
                            }}
                        >
                            Confirm Selection
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CardSelection;