import { useRef, useState, type RefObject } from "react";
import { type UserConfirmationState, type DraftCard, type DraftCardType, type SyncData, type User, type UserReadyState, type WsMessage } from "../../types";
import { DRAFT_WS_SERVER_ENDPOINT } from "../constants";
import { useDraftStore } from "../draftStore";

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
    } = useDraftStore();

    const [connected, setConnected] = useState<boolean>(false);
    const [input, setInput] = useState<string>("");
    const [started, setStarted] = useState<boolean>(false);
    
    const [users, setUsers] = useState<User[]>([]);
    const [confirmedState, setConfirmedState] = useState<UserConfirmationState[]>([]);

    const [usersReady, setUsersReady] = useState<UserReadyState[]>([]);
    const [ready, setReady] = useState<boolean>(false);
    const [selectedCards, setSelectedCards] = useState<DraftCard<any>[]>([]);

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
    };

    const handelSync = (msg:WsMessage<SyncData>) => {
        const syncData = msg.data;
        setSelectedCards(syncData.selectedCards);
        setReady(syncData.ready);
        setPack(syncData.currentPack);
        if (syncData.currentPack.length > 0) {
            setStarted(true);
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
            return;
        }
        if (selectedCards.length >= 2) {
            setSelectedCards([selectedCards[1], card]);
        } else {
            setSelectedCards([...selectedCards, card]);
        }
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
        confirmedState
    };
};