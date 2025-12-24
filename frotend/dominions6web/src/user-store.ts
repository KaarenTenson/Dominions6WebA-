// stores/useMessageStore.ts
import { create } from "zustand";

import type { User } from "../types";

type UserStore = {
  user: User;
  otherUsers: Map<string, User>;
  setUserName: (name: string) => void;
  setNation: (nation: string) => void;
  getUser: () => Promise<void>;
  getOtherUser: (userId: string) => Promise<User | null>;
  getUserMap: () => Map<string, User>;
};

export const useUserStore = create<UserStore>((set, get) => ({
  user: { username: "quest", nation: "ma olen loll" },
  otherUsers: new Map(),

  setUserName: (name) =>
    set((state) => ({
      user: {
        username: name,
        nation: state.user.nation,
        profilePicId: state.user.profile_pic_id,
      },
    })),

  setNation: (nation) =>
    set((state) => ({
      user: {
        username: state.user.username,
        nation: nation,
        profilePicId: state.user.profile_pic_id,
      },
    })),
  getUser: async () => {
    await fetch("http://localhost:3000/user", {
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
  getOtherUser: async (userId: string):Promise<User | null> => {
    if (get().otherUsers.has(userId)) {
      return get().otherUsers.get(userId) ? get().otherUsers.get(userId)!! : null;
    }
    try {
      const res = await fetch(`http://localhost:3000/user/${userId}`, {
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
  }
}));
