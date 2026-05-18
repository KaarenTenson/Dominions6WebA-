import { useEffect} from "react";
import type { DraftCard, ResetData, User, UserConfirmationState, UserReadyState } from "../types";
import { useDraftWebSocket } from "./views/draftSockets";
import { SERVER_ENDPOINT } from "./constants";
import { useUserStore } from "./user-store";
import UnitCard from "./components/unit-card";
import CardSelection from "./components/card-selection";
import { C, cinzel, crimson, Ornament, CheckIcon, SpinnerIcon, getConfirmedState } from "./draft-shared";
import MagicSiteCard from "./components/magic-card";
/* -------------------------------------------------------------------------- */
/*  FONTS — add to index.html if not already present:
    <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:wght@300;400;600&display=swap" rel="stylesheet">
/* -------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------- */
/*  DESIGN TOKENS                                                              */
/* -------------------------------------------------------------------------- */


const WifiIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
);

const WifiOffIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55M5 12.55a10.94 10.94 0 0 1 5.17-2.39M10.71 5.05A16 16 0 0 1 22.56 9M1.42 9a15.91 15.91 0 0 1 4.7-2.88M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
    </svg>
);

/* -------------------------------------------------------------------------- */
/*  HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const getReadyState = (userId: string, readyStates: UserReadyState[]): boolean =>
    readyStates.find((u) => u.userId === userId)?.ready ?? false;

function ResetButton({ resetState, sendReset, currentUserId }: {
    resetState: ResetData[];
    sendReset: () => void;
    currentUserId: string;
}) {
    const hasVoted = resetState.some(r => r.userId === currentUserId && r.reset);
    const voteCount = resetState.filter(r => r.reset).length;

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
            <button
                onClick={() => { sendReset(); }}
                style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    ...cinzel, fontSize: "11px", letterSpacing: "0.12em",
                    textTransform: "uppercase" as const,
                    color: hasVoted ? "#932f2f" : C.red,
                    background: "#5a2c2c",
                    border: `1px solid "#5a1a1a"`,
                    borderRadius: "3px", padding: "8px 16px",
                    cursor: hasVoted ? "default" : "pointer",
                    opacity: hasVoted ? 0.5 : 1,
                    transition: "all 0.15s",
                }}
            >
                ↺ Reset Game
            </button>

            {voteCount > 0 && (
                <div style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    ...cinzel, fontSize: "10px", letterSpacing: "0.1em",
                    color: voteCount >= 2 ? C.red : "#5a3030",
                }}>
                    <span>{voteCount}/2 voted</span>
                    <div style={{ display: "flex", gap: "4px" }}>
                        {[0, 1].map(i => (
                            <span key={i} style={{
                                width: "8px", height: "8px", borderRadius: "50%",
                                background: i < voteCount ? "#e41515" : "#973535",
                                border: `1px solid ${i < voteCount ? "#ff0000" : "#c42929"}`,
                                display: "inline-block",
                            }} />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* -------------------------------------------------------------------------- */
/*  PLAYERS SECTION                                                            */
/* -------------------------------------------------------------------------- */

type PlayersSectionProps = {
    users: any[];
    usersReady: UserReadyState[];
    currentUserId: string;
    setReady: (ready: boolean) => void;
    sendReadyEvent: (ready: boolean) => void;
};

const PlayersSection = ({
    users, usersReady, currentUserId, setReady, sendReadyEvent,
}: PlayersSectionProps) => {
    const readyCount = usersReady.filter((u) => u.ready).length;
    const allReady = readyCount === users.length && users.length > 0;

    return (
        <div>
            {/* Section header */}
            <div style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between", marginBottom: "20px",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <h2 style={{
                        ...cinzel, fontSize: "20px", fontWeight: 700,
                        color: C.gold, margin: 0, letterSpacing: "0.06em",
                        textTransform: "uppercase",
                    }}>
                        Players
                    </h2>
                    <Ornament />
                </div>
                <div style={{
                    ...cinzel, fontSize: "11px", letterSpacing: "0.12em",
                    color: allReady ? C.emerald : C.goldDim,
                    background: allReady ? C.emeraldFaint : C.goldFaint,
                    border: `1px solid ${allReady ? C.emeraldDim : C.borderBright}`,
                    borderRadius: "3px", padding: "4px 12px",
                    textTransform: "uppercase",
                }}>
                    {readyCount} / {users.length} Ready
                </div>
            </div>

            {/* Player grid */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "12px",
            }}>
                {users.map((user) => {
                    const ready = getReadyState(user.id || "", usersReady);
                    const isCurrentUser = user.id === currentUserId;

                    return (
                        <div key={user.id} style={{
                            background: ready ? "#0a1a10" : C.surface,
                            border: `1px solid ${ready ? C.emeraldDim : C.border}`,
                            borderRadius: "4px",
                            padding: "16px",
                            transition: "border-color 0.2s, background 0.2s",
                            position: "relative",
                        }}>
                            {/* Corner filigree */}
                            <div style={{
                                position: "absolute", top: 6, left: 6,
                                width: 14, height: 14,
                                borderTop: `1px solid ${ready ? C.emerald : C.borderBright}`,
                                borderLeft: `1px solid ${ready ? C.emerald : C.borderBright}`,
                                opacity: 0.5,
                            }} />
                            <div style={{
                                position: "absolute", top: 6, right: 6,
                                width: 14, height: 14,
                                borderTop: `1px solid ${ready ? C.emerald : C.borderBright}`,
                                borderRight: `1px solid ${ready ? C.emerald : C.borderBright}`,
                                opacity: 0.5,
                            }} />

                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {/* Avatar */}
                                <div style={{ position: "relative", flexShrink: 0 }}>
                                    <img
                                        src={user.profilePicId
                                            ? `${SERVER_ENDPOINT}/blob/${user.profilePicId}`
                                            : "https://placehold.co/56x56/0e0c0a/7a5c28?text=?"}
                                        alt={user.username}
                                        style={{
                                            width: 52, height: 52,
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                            border: `2px solid ${ready ? C.emeraldDim : C.borderBright}`,
                                            display: "block",
                                        }}
                                    />
                                    <div style={{
                                        position: "absolute", bottom: -2, right: -2,
                                        width: 20, height: 20, borderRadius: "50%",
                                        background: ready ? "#166534" : "#1c1510",
                                        border: `2px solid ${C.bg}`,
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        color: ready ? C.emerald : C.muted,
                                    }}>
                                        {ready ? <CheckIcon /> : <SpinnerIcon />}
                                    </div>
                                </div>

                                {/* Info */}
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                                        <span style={{
                                            ...cinzel, fontSize: "13px", fontWeight: 600,
                                            color: C.gold, overflow: "hidden",
                                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                                        }}>
                                            {user.username}
                                        </span>
                                        {isCurrentUser && (
                                            <span style={{
                                                ...cinzel, fontSize: "8px", letterSpacing: "0.1em",
                                                background: "#0a1a2a", color: "#60a0d0",
                                                border: "1px solid #1a3a5a",
                                                borderRadius: "2px", padding: "1px 6px",
                                                textTransform: "uppercase", flexShrink: 0,
                                            }}>
                                                You
                                            </span>
                                        )}
                                    </div>

                                    {user.nation && (
                                        <div style={{ ...crimson, fontSize: "12px", color: C.muted, fontStyle: "italic" }}>
                                            {user.nation}
                                        </div>
                                    )}

                                    <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                        <span style={{
                                            ...cinzel, fontSize: "8px", letterSpacing: "0.12em",
                                            textTransform: "uppercase",
                                            color: ready ? C.emerald : "#d4a020",
                                            background: ready ? C.emeraldFaint : "#1a1206",
                                            border: `1px solid ${ready ? C.emeraldDim : "#4a3010"}`,
                                            borderRadius: "2px", padding: "2px 8px",
                                        }}>
                                            {ready ? "Ready" : "Preparing"}
                                        </span>

                                        {isCurrentUser && (
                                            <button
                                                onClick={() => { setReady(!ready); sendReadyEvent(!ready); }}
                                                style={{
                                                    ...cinzel, fontSize: "8px", letterSpacing: "0.12em",
                                                    textTransform: "uppercase",
                                                    cursor: "pointer", borderRadius: "2px",
                                                    padding: "2px 10px",
                                                    color: ready ? C.red : C.gold,
                                                    background: ready ? C.redFaint : C.goldFaint,
                                                    border: `1px solid ${ready ? "#5a1a1a" : C.borderBright}`,
                                                    transition: "all 0.15s",
                                                }}
                                            >
                                                {ready ? "Unready" : "Ready Up"}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  DRAFT PACK SECTION                                                         */
/* -------------------------------------------------------------------------- */

type DraftPackSectionProps = {
    currentPack: DraftCard<any>[];
    selectedCards: DraftCard<any>[];
    selectCards: (card: DraftCard<any>) => void;
    confirmCards: (cards: DraftCard<any>[]) => void;
    users: User[];
    confirmedState: UserConfirmationState[];
};

const DraftPackSection = ({
    currentPack, selectedCards, selectCards, confirmCards, users, confirmedState,
}: DraftPackSectionProps) => {
    //const confirmedCount = confirmedState.filter((u) => u.confirmed).length;

    return (
        <div>
            {/* Section header */}
            <div style={{
                display: "flex", alignItems: "flex-start",
                justifyContent: "space-between", marginBottom: "24px",
                flexWrap: "wrap", gap: "16px",
            }}>
                <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "4px" }}>
                        <h2 style={{
                            ...cinzel, fontSize: "20px", fontWeight: 700,
                            color: C.gold, margin: 0, letterSpacing: "0.06em",
                            textTransform: "uppercase",
                        }}>
                            Current Pack
                        </h2>
                        <Ornament />
                    </div>
                    <p style={{ ...crimson, fontSize: "14px", color: C.muted, margin: 0, fontStyle: "italic" }}>
                        {currentPack.length} cards — select your picks
                    </p>
                </div>

                {/* Player confirmation pills */}
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {users.map((user) => {
                        const confirmed = getConfirmedState(user.id || "", confirmedState);
                        return (
                            <div key={user.id} style={{
                                display: "flex", alignItems: "center", gap: "8px",
                                background: confirmed ? "#0a1a10" : C.surface,
                                border: `1px solid ${confirmed ? C.emeraldDim : C.border}`,
                                borderRadius: "3px", padding: "6px 12px",
                                transition: "all 0.2s",
                            }}>
                                <img
                                    src={user.profilePicId
                                        ? `${SERVER_ENDPOINT}/blob/${user.profilePicId}`
                                        : "https://placehold.co/32x32/0e0c0a/7a5c28?text=?"}
                                    alt={user.username}
                                    style={{
                                        width: 28, height: 28, borderRadius: "50%",
                                        objectFit: "cover",
                                        border: `1px solid ${confirmed ? C.emeraldDim : C.borderBright}`,
                                        display: "block",
                                    }}
                                />
                                <div>
                                    <div style={{ ...cinzel, fontSize: "11px", color: C.gold, fontWeight: 600 }}>
                                        {user.username}
                                    </div>
                                    <div style={{
                                        ...cinzel, fontSize: "8px", letterSpacing: "0.1em",
                                        textTransform: "uppercase",
                                        color: confirmed ? C.emerald : "#d4a020",
                                    }}>
                                        {confirmed ? "Confirmed" : "Selecting..."}
                                    </div>
                                </div>
                                <div style={{ color: confirmed ? C.emerald : C.textDim }}>
                                    {confirmed ? <CheckIcon /> : <SpinnerIcon />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Pack content */}
            {currentPack.length === 0 ? (
                <div style={{
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    height: "240px",
                    background: C.surface,
                    border: `1px dashed ${C.border}`,
                    borderRadius: "4px",
                    gap: "12px",
                }}>
                    <SpinnerIcon size={28} />
                    <p style={{ ...crimson, color: C.muted, fontSize: "16px", fontStyle: "italic", margin: 0 }}>
                        Waiting for next pack...
                    </p>
                </div>
            ) : (
                <>
                    <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                        gap: "16px",
                    }}>
                        {currentPack.map((card) => {
                            const selected = selectedCards.some((c) => c.id === card.id);
                            if (card.type == "magic_site") {
                                return <MagicSiteCard key={card.id}
                                    site={card.data}
                                    selected={selected}
                                    onClick={() => selectCards(card)}></MagicSiteCard>
                            } else {
                                return (
                                    <UnitCard
                                        key={card.id}
                                        unit={card.data}
                                        selected={selected}
                                        onClick={() => selectCards(card)}
                                    />
                                );
                            }
                        })}
                    </div>

                    {/* Confirm bar */}
                    <div style={{
                        marginTop: "24px",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        flexWrap: "wrap", gap: "12px",
                        padding: "16px 20px",
                        background: C.surface,
                        border: `1px solid ${C.border}`,
                        borderRadius: "4px",
                    }}>
                        <div style={{ ...crimson, fontSize: "14px", color: C.text, fontStyle: "italic" }}>
                            {selectedCards.length === 0
                                ? "No cards selected"
                                : `${selectedCards.length} card${selectedCards.length > 1 ? "s" : ""} selected`}
                        </div>
                        <button
                            onClick={() => confirmCards(selectedCards)}
                            disabled={selectedCards.length === 0}
                            style={{
                                ...cinzel, fontSize: "11px", letterSpacing: "0.15em",
                                textTransform: "uppercase", fontWeight: 700,
                                padding: "10px 28px", borderRadius: "3px", cursor: "pointer",
                                background: selectedCards.length > 0 ? C.goldFaint : "#120f0a",
                                color: selectedCards.length > 0 ? C.gold : C.muted,
                                border: `1px solid ${selectedCards.length > 0 ? C.borderBright : C.border}`,
                                transition: "all 0.15s",
                                opacity: selectedCards.length === 0 ? 0.5 : 1,
                            }}
                        >
                            Confirm Selection
                        </button>
                    </div>
                </>
            )}
        <div style={{padding : "100px"}}/>    
        </div>
    );
};

/* -------------------------------------------------------------------------- */
/*  ORNAMENT                                                                   */
/* -------------------------------------------------------------------------- */



/* -------------------------------------------------------------------------- */
/*  MAIN PAGE                                                                  */
/* -------------------------------------------------------------------------- */

export default function DraftLobby() {
    const {
        users, connected, started, currentPack, usersReady,
        startDraftWsConnection, sendReadyEvent, setReady,
        selectedCards, selectCards, confirmCards, confirmedState, isCardSelection, chooseDraftedCards,
        confirmChosenDraftedCards, chosenDraftedCards, isEnded, blodId, resetState, sendReset, chooseHeat,
        chooseStartingLocation
    } = useDraftWebSocket();

    const { user, getUser } = useUserStore();

    useEffect(() => {
        getUser();
        const cleanup = startDraftWsConnection();
        return () => { cleanup(); };
    }, []);

    return (
        <>
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
            `}</style>

            <div style={{
                minHeight: "100vh",
                background: C.bg,
                padding: "32px 24px",
                color: C.text,
                ...crimson,
            }}>
                <div style={{ maxWidth: "1400px", margin: "0 auto" }}>

                    {/* ── HEADER ─────────────────────────────────────────── */}
                    <div style={{
                        display: "flex", alignItems: "flex-start",
                        justifyContent: "space-between", marginBottom: "40px",
                        flexWrap: "wrap", gap: "16px",
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "6px" }}>
                                <h1 style={{
                                    ...cinzel, fontSize: "32px", fontWeight: 700,
                                    color: C.gold, margin: 0, letterSpacing: "0.08em",
                                    textTransform: "uppercase",
                                }}>
                                    Draft Lobby
                                </h1>
                                <Ornament />
                            </div>
                            <p style={{ ...crimson, fontSize: "15px", color: C.muted, margin: 0, fontStyle: "italic" }}>
                                {started ? "The draft is in progress" : "Awaiting all commanders..."}
                            </p>
                        </div>

                        {/* Connection badge */}
                        <div style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            ...cinzel, fontSize: "11px", letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: connected ? C.emerald : C.red,
                            background: connected ? C.emeraldFaint : C.redFaint,
                            border: `1px solid ${connected ? C.emeraldDim : "#5a1a1a"}`,
                            borderRadius: "3px", padding: "8px 16px",
                        }}>
                            {connected ? <WifiIcon /> : <WifiOffIcon />}
                            {connected ? "Connected" : "Disconnected"}
                        </div>
                        <ResetButton resetState={resetState} sendReset={sendReset} currentUserId={user.id!!}/>
                    </div>

                    {/* ── DIVIDER ────────────────────────────────────────── */}
                    <div style={{
                        height: "1px",
                        background: `linear-gradient(90deg, transparent, ${C.borderBright} 30%, ${C.borderBright} 70%, transparent)`,
                        marginBottom: "40px",
                    }} />

                    {/* ── CONTENT ────────────────────────────────────────── */}
                    {

                    }
                    {!started ? (
                        <PlayersSection
                            users={users}
                            usersReady={usersReady}
                            currentUserId={user.id ?? "0"}
                            setReady={setReady}
                            sendReadyEvent={sendReadyEvent}
                        />
                    ) : isEnded ? (<FileDownloadComponent blobId={blodId!!} />) : isCardSelection ? (
                        <CardSelection
                            chooseDraftedCards={chooseDraftedCards}
                            confirmChosenDraftedCards={confirmChosenDraftedCards}
                            chosenDraftedCards={chosenDraftedCards}
                            users={users}
                            confirmedState={confirmedState}
                            chooseHeat={chooseHeat}
                            chooseStartingLocation={chooseStartingLocation}
                        />
                    ) : (
                        <DraftPackSection
                            currentPack={currentPack}
                            selectedCards={selectedCards}
                            selectCards={selectCards}
                            confirmCards={confirmCards}
                            confirmedState={confirmedState}
                            users={users}
                        />
                    )}
                </div>
            </div>
        </>
    );
}
type FileDownloadProps = {
    blobId: string;
};

const DownloadIcon = () => (
    <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
    </svg>
);

const TrophyIcon = () => (
    <svg
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M17 5h3v2a4 4 0 0 1-4 4" />
        <path d="M7 5H4v2a4 4 0 0 0 4 4" />
    </svg>
);

const FileDownloadComponent = ({ blobId }: FileDownloadProps) => {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "420px",
            }}
        >
            <div
                style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "620px",
                    background: `linear-gradient(180deg, ${C.surfaceAlt} 0%, ${C.surface} 100%)`,
                    border: `1px solid ${C.border}`,
                    borderRadius: "6px",
                    padding: "42px 36px",
                    overflow: "hidden",
                    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
                }}
            >
                {/* decorative corners */}
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        left: 10,
                        width: 24,
                        height: 24,
                        borderTop: `1px solid ${C.borderBright}`,
                        borderLeft: `1px solid ${C.borderBright}`,
                        opacity: 0.5,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        width: 24,
                        height: 24,
                        borderTop: `1px solid ${C.borderBright}`,
                        borderRight: `1px solid ${C.borderBright}`,
                        opacity: 0.5,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: 10,
                        left: 10,
                        width: 24,
                        height: 24,
                        borderBottom: `1px solid ${C.borderBright}`,
                        borderLeft: `1px solid ${C.borderBright}`,
                        opacity: 0.5,
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: 10,
                        right: 10,
                        width: 24,
                        height: 24,
                        borderBottom: `1px solid ${C.borderBright}`,
                        borderRight: `1px solid ${C.borderBright}`,
                        opacity: 0.5,
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                    }}
                >
                    {/* icon */}
                    <div
                        style={{
                            width: 78,
                            height: 78,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: C.goldFaint,
                            border: `1px solid ${C.borderBright}`,
                            color: C.gold,
                            marginBottom: "24px",
                            boxShadow: `0 0 30px ${C.goldFaint}`,
                        }}
                    >
                        <TrophyIcon />
                    </div>

                    <div style={{ marginBottom: "18px" }}>
                        <div
                            style={{
                                ...cinzel,
                                fontSize: "28px",
                                fontWeight: 700,
                                color: C.gold,
                                letterSpacing: "0.08em",
                                textTransform: "uppercase",
                                marginBottom: "10px",
                            }}
                        >
                            Draft Complete
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                marginBottom: "16px",
                            }}
                        >
                            <Ornament />
                        </div>

                        <p
                            style={{
                                ...crimson,
                                fontSize: "17px",
                                lineHeight: 1.6,
                                color: C.text,
                                margin: 0,
                                maxWidth: "460px",
                                fontStyle: "italic",
                            }}
                        >
                            The drafting session has concluded. Download the
                            generated file to review the final roster and match
                            results.
                        </p>
                    </div>

                    {/* download button */}
                    <a
                        href={`${SERVER_ENDPOINT}/blob/${blobId}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            textDecoration: "none",
                        }}
                    >
                        <button
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                padding: "14px 28px",
                                background: C.goldFaint,
                                color: C.gold,
                                border: `1px solid ${C.borderBright}`,
                                borderRadius: "4px",
                                cursor: "pointer",
                                transition: "all 0.18s ease",
                                textTransform: "uppercase",
                                letterSpacing: "0.14em",
                                fontWeight: 700,
                                ...cinzel,
                                fontSize: "12px",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2f2110";
                                e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                e.currentTarget.style.boxShadow =
                                    "0 6px 20px rgba(212,168,71,0.15)";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = C.goldFaint;
                                e.currentTarget.style.transform =
                                    "translateY(0px)";
                                e.currentTarget.style.boxShadow = "none";
                            }}
                        >
                            <DownloadIcon />
                            Download Draft File
                        </button>
                    </a>

                    <div
                        style={{
                            marginTop: "18px",
                            ...cinzel,
                            fontSize: "9px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            color: C.textDim,
                            opacity: 0.75,
                        }}
                    >
                        File ready for export
                    </div>
                </div>
            </div>
        </div>
    );
};