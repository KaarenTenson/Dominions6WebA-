import { useRef, useState} from "react";
import { type UserConfirmationState, type DraftCard, type SyncData, type User, type UserReadyState, type WsMessage, type DraftedCardChoosingState, type ResetData, type StartLocation } from "../../types";
import { DRAFT_WS_SERVER_ENDPOINT } from "../constants";
import { useDraftStore } from "../draftStore";
import { useUserStore } from "../user-store";

// You cannot use hooks outside React components/hooks.
// Move refs and state into a custom hook.

export const useDraftWebSocket = () => {
    const socketRef = useRef<WebSocket | null>(null);

    const {
        commanders,
        magicSites,
        units,
        currentPack,
        addCommander,
        addMagicSite,
        addUnit,
        setPack,
        addPretender,
        setCommanders,
        setMagicSites,
        setPretenders,
        setUnits
    } = useDraftStore();

    const { user} = useUserStore();
    const [connected, setConnected] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [started, setStarted] = useState<boolean>(false);

    const [users, setUsers] = useState<User[]>([]);
    const [confirmedState, setConfirmedState] = useState<UserConfirmationState[]>([]);

    const [usersReady, setUsersReady] = useState<UserReadyState[]>([]);
    const [ready, setReady] = useState<boolean>(false);
    const [selectedCards, setSelectedCards] = useState<DraftCard<any>[]>([]);
    const [isCardSelection, setIsCardSelection] = useState<boolean>(false);
    const [chosenDraftedCards, setChosenDraftedCards] = useState<DraftedCardChoosingState>({ pretenders: [], commanders: [], units: [], magicSites: [], heat: 0, startLocation: "land" });

    const [resetState, setResetState] = useState<ResetData[]>([]);
    const [isEnded, setIsEnded] = useState<boolean>(false);
    const [blodId, setBlobId] = useState<string | undefined>("");

    const lobby = "DRAFT";

    const startDraftWsConnection = (): (() => void) => {
        const url = new URL(DRAFT_WS_SERVER_ENDPOINT);
        url.searchParams.append("lobbyId", lobby);
        socketRef.current = new WebSocket(url.toString());

        socketRef.current.onopen = () => {
            console.log("WebSocket connected");
            setConnected(true);
        };

        socketRef.current.onmessage = (event: MessageEvent<string>) => {
            const msg: WsMessage<unknown> = JSON.parse(event.data);
            handleMessage(msg);
        };

        socketRef.current.onerror = (error: Event) => {
            console.error("WebSocket error:", error);
        };

        socketRef.current.onclose = () => {
            console.log("WebSocket closed");
            setConnected(false);
        };

        return () => {
            socketRef.current?.close();
        };
    };

    const handleMessage = (msg: WsMessage<unknown>): void => {
        if (msg.type === "next_pack") {
            setSelectedCards([]);
            setPack(msg.data as DraftCard<any>[]);
        }
        if (msg.type === "start") {
            setStarted(true);
        }
        if (msg.type === "reset") {
            window.location.reload();
        }
        if (msg.type === "user_data") {
            setUsers(msg.data as User[]);
        }
        if (msg.type === "ready_states") {
            setUsersReady(msg.data as UserReadyState[]);
        }
        if (msg.type === "sync") {
            handelSync(msg as WsMessage<SyncData>);
        }
        if (msg.type === "confirm_event") {
            setConfirmedState(msg.data as UserConfirmationState[]);
        }
        if (msg.type == "reset_event") {
            setResetState(msg.data as ResetData[]);
        }
        if (msg.type === "card_selection") {
            setIsCardSelection(true);
        }
        if (msg.type === "end") {
            setIsEnded(true);
            setBlobId(msg.data as string);
        }
    };

    const handelSync = (msg: WsMessage<SyncData>) => {
        const syncData = msg.data;
        setSelectedCards(syncData.selectedCards);
        setReady(syncData.ready);
        setPack(syncData.currentPack);
        setCommanders(syncData.commanders);
        setPretenders(syncData.pretenders);
        setMagicSites(syncData.magicSites);
        setUnits(syncData.units);
        setIsEnded(syncData.isEnded);
        setBlobId(syncData.blobId);

        if (syncData.currentPack.length > 0) {
            setStarted(true);
        }
        if (syncData.cardSelection) {
            setStarted(true);
            setReady(true);
            setIsCardSelection(true);
        }

    }
    const sendConfirmMsg = (cards: DraftCard<any>[]): void => {
        const confirmMsg: WsMessage<DraftCard<any>[]> = {
            data: cards,
            lobbyId: lobby,
            type: "confirm",
        };

        socketRef.current?.send(JSON.stringify(confirmMsg));
    };
    const confirmChosenDraftedCards = () => {
        if (chosenDraftedCards.commanders.length != 8) {
            alert("choosen 8 commanders");
            return;
        }
        if (chosenDraftedCards.units.length != 8) {
            alert("choosen 8 units");
            return;
        }
        if (chosenDraftedCards.magicSites.length != 2) {
            alert("choosen 2 sites");
            return;
        }
        if (chosenDraftedCards.pretenders.length !=4) {
            alert("choosen 4 pretendesr");
            return;
        }
        const confirmMsg: WsMessage<DraftedCardChoosingState> = {
            data: chosenDraftedCards,
            lobbyId: lobby,
            type: "confirm_drafted_cards",
        };

        socketRef.current?.send(JSON.stringify(confirmMsg));
    }

    const confirmCards = (cards: DraftCard<any>[]): void => {
        if (cards.length < 1) {
            alert("not enough cards selected");
            return;
        }
        const type = cards[0].type;
        if (type === "commander") {
            confirmCommanders(cards);
        }
        if (type === "unit") {
            confirmUnits(cards);
        }
        if (type === "magic_site") {
            confirmMagicSites(cards);
        }
        if (type === "pretender") {
            confirmPretenders(cards);
        }
    }
    const sendReset = () => {
        const userId = user.id!!;
        const currentUserResetState = resetState.find((state) => state.userId === userId);
        const value = currentUserResetState === undefined ? true : !currentUserResetState.reset;
        const resetMsg: WsMessage<boolean> = {
            data: value,
            lobbyId: lobby,
            type: "reset",
        };
        socketRef.current?.send(JSON.stringify(resetMsg));
    }
    const confirmPretenders = (cards: DraftCard<any>[]): void => {
        try {
            sendConfirmMsg(cards);
            cards.forEach((card) => {
                addPretender(card);
            });
        } catch (error) {
            console.error(error);
        }
    };
    const confirmCommanders = (cards: DraftCard<any>[]): void => {
        try {
            sendConfirmMsg(cards);

            cards.forEach((card) => {
                addCommander(card);
            });
        } catch (error) {
            console.error(error);
        }
    };
    const selectCards = (card: DraftCard<any>): void => {
        if (selectedCards.some((c) => c.id == card.id)) {
            setSelectedCards([...selectedCards.filter((c) => c.id != card.id)]);
            return;
        }
        if (selectedCards.length >= 2) {
            setSelectedCards([selectedCards[1], card]);
        } else {
            setSelectedCards([...selectedCards, card]);
        }
    }
    const removeIfAlreadyChosen = (card: DraftCard<any>, state: DraftedCardChoosingState): boolean => {

        if (state.commanders.some((c) => c.id === card.id)) {
            setChosenDraftedCards(prev => {
                const commanders = prev.commanders.filter((c) => c.id != card.id);
                return {
                    ...prev,
                    commanders
                };
            })
            return true;
        }
        if (state.units.some((c) => c.id === card.id)) {
            setChosenDraftedCards(prev => {
                const units = prev.units.filter((c) => c.id != card.id);
                return {
                    ...prev,
                    units
                };
            })
            return true;
        }
        if (state.pretenders.some((c) => c.id === card.id)) {
            setChosenDraftedCards(prev => {
                const pretenders = prev.pretenders.filter((c) => c.id != card.id);
                return {
                    ...prev,
                    pretenders
                };
            })
            return true;
        }
        if (state.magicSites.some((c) => c.id === card.id)) {
            setChosenDraftedCards(prev => {
                const magicSites = prev.magicSites.filter((c) => c.id != card.id);
                return {
                    ...prev,
                    magicSites
                };
            })
            return true;
        }
        return false;
    }
    const chooseDraftedCards = (card: DraftCard<any>): void => {
        if (removeIfAlreadyChosen(card, chosenDraftedCards)) {
            return;
        }
        setChosenDraftedCards(prev => {
            if (card.type === "commander") {

                const commanders = [...prev.commanders, card].slice(-8);

                return {
                    ...prev,
                    commanders
                };
            }

            if (card.type === "unit") {
                const units = [...prev.units, card].slice(-8);

                return {
                    ...prev,
                    units
                };
            }

            if (card.type === "pretender") {
                const pretenders = [...prev.pretenders, card].slice(-4);

                return {
                    ...prev,
                    pretenders
                };
            }
            if (card.type === "magic_site") {
                const magicSites = [...prev.magicSites, card].slice(-2);
                return {
                    ...prev,
                    magicSites
                };
            }


            return prev;
        });
    };
    const chooseHeat = (heat: number) => {
        setChosenDraftedCards(prev => {
            return {
                ...prev,
                heat:heat
            };
        })
    }
    const chooseStartingLocation = (location: StartLocation) => {
        setChosenDraftedCards(prev => {
            return {
                ...prev,
                startLocation:location
            };
        })
    }
    const confirmMagicSites = (cards: DraftCard<any>[]): void => {
        try {
            sendConfirmMsg(cards);

            cards.forEach((card) => {
                addMagicSite(card);
            });
        } catch (error) {
            console.error(error);
        }
    };

    const confirmUnits = (cards: DraftCard<any>[]): void => {
        try {
            sendConfirmMsg(cards);
            cards.forEach((card) => {
                addUnit(card);
            });
        } catch (error) {
            console.error(error);
        }
    };

    const sendReadyEvent = (isReady: boolean) => {
        const confirmMsg: WsMessage<boolean> = {
            data: isReady,
            lobbyId: lobby,
            type: "ready",
        };

        socketRef.current?.send(JSON.stringify(confirmMsg));
    }

    return {
        socketRef,
        users,
        started,
        ready,
        setReady,
        setUsers,
        usersReady,
        connected,
        input,
        setInput,
        commanders,
        magicSites,
        units,
        currentPack,
        setSelectedCards,
        selectedCards,
        startDraftWsConnection,
        confirmCommanders,
        confirmMagicSites,
        confirmUnits,
        sendReadyEvent,
        confirmCards,
        selectCards,
        confirmedState,
        isCardSelection,
        chooseDraftedCards,
        confirmChosenDraftedCards,
        chosenDraftedCards,
        isEnded,
        blodId,
        sendReset,
        resetState,
        chooseHeat,
        chooseStartingLocation
    };
};