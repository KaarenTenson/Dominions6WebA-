// stores/useMessageStore.ts
import { create } from "zustand";

import type { Lobby, Message, Error, Success } from "../types";
import { useUserStore } from "./user-store";

type LobbyStore = {
  lobbys: Lobby[];
  addLobby: (lobby: Lobby) => Promise<void>;
  getAllLobbys: () => Promise<void>;
  checkLobbyAcces: (lobbyId: string) => Promise<boolean>;
  loginToLobby: (lobby: Lobby) => Promise<boolean>;
};

export const useLobbyStore = create<LobbyStore>((set, get) => ({
  lobbys: [],
  addLobby: async (lobby) => {
    const res = await fetch("http://localhost:3000/lobby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // IMPORTANT for cookies
      body: JSON.stringify(lobby),
    });

    lobby.password = "";
    await get().getAllLobbys();
  },
  getAllLobbys: async () => {
    const res = await fetch("http://localhost:3000/lobby", {
      credentials: "include",
    });
    const lobbys: Lobby[] = await res.json();
    set({ lobbys: lobbys });
  },
  checkLobbyAcces: async (lobbydId: string) => {
    try {
      const res = await fetch(`http://localhost:3000/lobby/auth/${lobbydId}`, {
        credentials: "include",
      });
      const jsonBody: Success | Error = await res.json();
      if ((jsonBody as Error).error) {
        return false;
      } else if (
        (jsonBody as Success).status &&
        (jsonBody as Success).status === "ok"
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },
  loginToLobby: async (lobby: Lobby): Promise<boolean> => {
    try {
      const res = await fetch(`http://localhost:3000/lobby/login/${lobby.id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(lobby)
      });
      const jsonBody: Success | Error = await res.json();
      if ((jsonBody as Error).error) {
        return false;
      } else if (
        (jsonBody as Success).status &&
        (jsonBody as Success).status === "ok"
      ) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  },
}));
