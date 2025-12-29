// stores/useMessageStore.ts
import { create } from "zustand";

import type { Nation, User } from "../types";
import { SERVER_ENDPOINT } from "./constants";

type UserStore = {
  user: User;
  otherUsers: Map<string, User>;
  dom6Data: Nation[];
  setUserName: (name: string) => void;
  setNation: (nation: string) => void;
  getUser: () => Promise<void>;
  getOtherUser: (userId: string) => Promise<User | null>;
  getUserMap: () => Map<string, User>;
  getDom6Nations: () => Promise<Nation[]>;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: { username: "quest", nation: "" },
  otherUsers: new Map(),
  dom6Data: [],

  setUserName: (name) =>
    set((state) => ({
      user: {
        username: name,
        nation: state.user.nation,
        profilePicId: state.user.profilePicId,
      },
    })),

  setNation: (nation) =>
    set((state) => ({
      user: {
        username: state.user.username,
        nation: nation,
        profilePicId: state.user.profilePicId,
      },
    })),
  getUser: async () => {
    await fetch(`${SERVER_ENDPOINT}/user`, {
      method: "GET",
      credentials: "include",
    })
      .then((body) => {
        body.json().then((usr: User) => {
          set({
            user: usr,
          });
        });
      })
      .catch(console.log);
  },
  getOtherUser: async (userId: string): Promise<User | null> => {
    if (get().otherUsers.has(userId)) {
      return get().otherUsers.get(userId)
        ? get().otherUsers.get(userId)!!
        : null;
    }
    try {
      const res = await fetch(`${SERVER_ENDPOINT}/user/${userId}`, {
        credentials: "include",
      });

      const usr: User = await res.json();

      set((state) => {
        const next = new Map(state.otherUsers);
        next.set(userId, usr);
        return { otherUsers: next };
      });
      return usr;
    } catch (err) {
      console.error(err);
      return null;
    }
  },
  getUserMap: () => {
    return get().otherUsers;
  },
  getDom6Nations: async () => {
    if (get().dom6Data.length > 0) {
      return get().dom6Data;
    }
    const res = await fetch(`${SERVER_ENDPOINT}/dom6/nation`, {
      credentials: "include",
    });
    const nations: Nation[] = await res.json();
    set({ dom6Data: nations });
    return nations;
  },
}));
