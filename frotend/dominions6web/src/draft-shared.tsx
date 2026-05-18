import type { UserConfirmationState } from "../types";

export const C = {
    bg: "#080705",
    surface: "#0e0c0a",
    surfaceAlt: "#120f0b",
    border: "#2e2210",
    borderBright: "#5a4020",
    gold: "#d4a847",
    goldDim: "#7a5c28",
    goldFaint: "#2a1e0e",
    emerald: "#4ade80",
    emeraldDim: "#166534",
    emeraldFaint: "#052e16",
    red: "#f87171",
    redFaint: "#2a0a0a",
    muted: "#5a4a30",
    text: "#c8b090",
    textDim: "#7a6040",
} as const;

export const cinzel: React.CSSProperties = {
    fontFamily: "'Cinzel', 'Georgia', serif",
};

export const crimson: React.CSSProperties = {
    fontFamily: "'Crimson Pro', 'Georgia', serif",
};

/* -------------------------------------------------------------------------- */
/*  ICONS                                                                      */
/* -------------------------------------------------------------------------- */

export const CheckIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 13l4 4L19 7" />
    </svg>
);

export const SpinnerIcon = ({ size = 12 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2.5}
        style={{ animation: "spin 1s linear infinite" }}>
        <circle cx="12" cy="12" r="10" strokeOpacity={0.25} />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);
export const getConfirmedState = (userId: string, confirmedStates: UserConfirmationState[]): boolean =>
    confirmedStates.find((u) => u.userId === userId)?.confirmed ?? false;
export const Ornament = () => (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", opacity: 0.4 }}>
        <div style={{ width: 20, height: 1, background: C.gold }} />
        <div style={{ width: 4, height: 4, background: C.gold, transform: "rotate(45deg)" }} />
        <div style={{ width: 20, height: 1, background: C.gold }} />
    </div>
);