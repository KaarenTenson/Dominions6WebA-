import { match } from "node:assert";
import { DraftCard } from "../../types";
import { Pretender } from "../draftypes/pretender";

export class DraftState {
  userDraftStates: Map<string, UserDraftSate>;
  turn: number;
  cardSelection: boolean;


  constructor() {
    this.userDraftStates = new Map<string, UserDraftSate>();
    this.turn = 0;
    this.cardSelection = false;
  }
  checkEmptyPacks() {
    const not_empty_packs = [...this.userDraftStates.values()].filter((ud) => ud.current_pack.length != 0);
    return not_empty_packs.length == 0;
  }
  checkConfirmed() {
    const unconfirmedUsers = [...this.userDraftStates.values()].filter((ud) => !ud.confirmed)
    if (unconfirmedUsers.length == 0) {
      return true;
    }
    return false;
  }
  checkWantsReset() {
    const unconfirmedUsers = [...this.userDraftStates.values()].filter((ud) => !ud.wantsReset)
    if (unconfirmedUsers.length == 0) {
      return true;
    }
    return false;
  }
  nextTurn() {
    this.userDraftStates.forEach((sess) => {
      sess.confirmed = false;
    })
  }
  getConfirmedStatus() {
    return [...this.userDraftStates.entries()].map((entry) => {
      const userId = entry[0];
      const state = entry[1];
      return { userId: userId, confirmed: state.confirmed };
    })

  }
  checkIsReady() {
    const notReadyUsers = [...this.userDraftStates.values()].filter((ud) => !ud.isReady)
    return notReadyUsers.length === 0;
  }
  forward_packs() {
    const user_states = [...this.userDraftStates.values()];
    const forward_packs = [];
    forward_packs.push(user_states[user_states.length - 1].current_pack);
    for (let i = 0; i < user_states.length - 1; i++) {
      forward_packs.push(user_states[i].current_pack);
    }
    for (let i = 0; i < user_states.length; i++) {
      user_states[i].current_pack = forward_packs[i];
    }

  }
  removeCard(card: DraftCard<string>, userState: UserDraftSate) {
    const card_index = userState?.current_pack.findIndex((c) => c.id == card.id);
    if (card_index == -1) {
      userState.units = [];
      userState.commanders = [];
      userState.magicSites = [];
      return;
    }
    userState.current_pack.splice(card_index, 1);
  }
  removeCards(cards: DraftCard<string>[], userState: UserDraftSate) {
    cards.forEach((card) => this.removeCard(card, userState));
  }
  selectCards(cards: DraftCard<any>[], user: string) {

    const userState = this.userDraftStates.get(user);
    if (cards.some((card) => !userState?.current_pack.some((c) => c.id == card.id))) {
      return;
    }
    userState!!.confirmed = true;
    userState!!.chosen_cards = cards;
  }

  addCards() {
    const userStates = [...this.userDraftStates.values()];
    userStates.forEach((userState) => {
      const cards = userState!!.chosen_cards;
      if (cards.length == 0) {
        return;
      }
      const type = cards[0].type;
      switch (type) {
        case "commander":
          {
            userState!!.commanders = userState!!.commanders.concat(cards as DraftCard<Pretender>[]);
            this.removeCards(cards, userState!!);
            break;
          }
        case "magic_site":
          {
            userState!!.magicSites = userState!!.magicSites.concat(cards);
            this.removeCards(cards, userState!!);
            break;
          }
        case "pretender":
          {
            userState!!.pretenders = userState!!.pretenders.concat(cards);
            this.removeCards(cards, userState!!);
          }
        case "unit":
          userState!!.units = userState!!.units.concat(cards);
          this.removeCards(cards, userState!!);
      }

    })
  }
}

export class UserDraftSate {
  commanders: DraftCard<Pretender>[];
  units: DraftCard<any>[];
  magicSites: DraftCard<any>[];
  current_pack: DraftCard<any>[];
  chosen_cards: DraftCard<any>[];
  pretenders: DraftCard<any>[];
  confirmed: boolean;
  user: string;
  isReady: boolean;
  wantsReset: boolean;

  toSyncInfo(cardSelection: boolean) {
    return {
      currentPack: this.current_pack,
      confirmed: this.confirmed,
      ready: this.isReady,
      selectedCards: this.chosen_cards,
      cardSelection: cardSelection,
    }
  }

  constructor(user: string) {
    this.chosen_cards = [];
    this.commanders = [];
    this.units = [];
    this.magicSites = [];
    this.confirmed = false;
    this.current_pack = [];
    this.user = user;
    this.isReady = false;
    this.wantsReset = false;
    this.pretenders = [];

  }
}
