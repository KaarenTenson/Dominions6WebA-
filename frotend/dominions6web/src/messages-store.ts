// stores/useMessageStore.ts
import { create } from "zustand";

import type { Message } from "../types";
import { useUserStore } from "./user-store";

type MessageStore = {
  messages: Message[];
  currentLobby: string|undefined;

  addMessage: (message: Message) => void;
  removeMessage: (id: string) => void;
  clearMessages: () => void;
  setMessages: (messages: Message[]) => void;
  setLobby: (lobbyId: string) => void;
  getAllMessages: () => Promise<void>;
  getAllMessagesFromLobby: (lobbyId: string) => Promise<string|null>;
};

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  currentLobby: undefined,
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  removeMessage: (id) =>
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    })),

  clearMessages: () => set({ messages: [] }),

  setMessages: (messages) => set({ messages }),
  setLobby: (lobbyId) => {
    set({ currentLobby: lobbyId })
  },
  getAllMessages: async () => {
    const userStore = useUserStore.getState();

    const res = await fetch("http://localhost:3000/message", {
      credentials: "include",
    });

    const messages: Message[] = await res.json();

    // fetch missing users (no await inside forEach)
    const userIds = [
      ...new Set(messages.map((m) => m.userId).filter(Boolean)),
    ] as string[];

    await Promise.all(userIds.map((id) => userStore.getOtherUser(id)));

    // attach users immutably
    const users = userStore.getUserMap();
    console.log(users);
    const hydrated:Message[] = messages.map((msg) => ({
      ...msg,
      user: msg.userId ? users.get(msg.userId) : undefined,
    }));

    set({ messages: hydrated });
  },
   getAllMessagesFromLobby: async (lobbyId: string): Promise<string|null> => {
    const userStore = useUserStore.getState();

    const res = await fetch(`http://localhost:3000/message/${lobbyId}`, {
      credentials: "include",
    });
    const body = await res.json();
    if (body.error) {
      return body.error as string;
    }
    const messages: Message[] = body;

    // fetch missing users (no await inside forEach)
    const userIds = [
      ...new Set(messages.map((m) => m.userId).filter(Boolean)),
    ] as string[];

    await Promise.all(userIds.map((id) => userStore.getOtherUser(id)));

    // attach users immutably
    const users = userStore.getUserMap();
    console.log(users);
    const hydrated:Message[] = messages.map((msg) => ({
      ...msg,
      user: msg.userId ? users.get(msg.userId) : undefined,
    }));

    set({ messages: hydrated });
    return null;
  },
}));
