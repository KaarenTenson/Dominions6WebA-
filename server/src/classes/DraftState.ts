import { match } from "node:assert";
import { DraftCard, DraftedCardChoosingState } from "../types.js";
import { Pretender } from "../draftypes/pretender.js";

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
    const wantsReset = [...this.userDraftStates.values()].filter((ud) => ud.wantsReset)
    if (wantsReset.length >= 2) {
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
  removeCard(card: DraftCard<any>, userState: UserDraftSate) {
    const card_index = userState?.current_pack.findIndex((c) => c.id == card.id);
    if (card_index == -1) {
      console.log("something weent wrooooong!!!!!")
      console.log(`pack ids: ${userState!!.chosen_cards.map((c) => c.id).join("%%")}`)
      console.log(`card id: ${card.id}`);
      //console.log(userState.current_pack);
      userState.units = [];
      userState.commanders = [];
      userState.magicSites = [];
      return;
    } else {
      console.log("removed stuff");
    }
    userState.current_pack.splice(card_index, 1);
  }
  removeCards(cards: DraftCard<any>[], userState: UserDraftSate) {
    cards.forEach((card) => this.removeCard(card, userState));
  }
  setSelectedChosenDraftedCards(chosenCards: DraftedCardChoosingState, userId:string) {
    if (chosenCards.commanders.length != 8) {
      return;
    }
    if (chosenCards.units.length != 8) {
      return;
    }
    if (chosenCards.pretenders.length != 4) {
      return;
    }
    if (chosenCards.magicSites.length != 2) {
      return;
    }
    if (chosenCards.heros.length != 1) {
      return;
    }
    const state = this.userDraftStates.get(userId);
    state!!.confirmed = true;
    state!!.chosenDraftedCards = chosenCards;
  }
  confirmSelectedChosenDraftedCards() {
    this.userDraftStates.forEach((state, id) => {
      state.confirmedChosenDraftedCards = state.chosenDraftedCards;
    })
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
            userState!!.commanders = userState!!.commanders.concat(cards);
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
            break;
          }
        case "unit":
            userState!!.units = userState!!.units.concat(cards);
            this.removeCards(cards, userState!!);
            break;
        case "hero":
            userState!!.heros = userState!!.heros.concat(cards);
            this.removeCards(cards, userState!!);
            break;
          
      }
      userState.chosen_cards = [];
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
  heros : DraftCard<any>[];
  chosenDraftedCards?: DraftedCardChoosingState;
  confirmedChosenDraftedCards?: DraftedCardChoosingState;
  confirmed: boolean;
  user: string;
  isReady: boolean;
  wantsReset: boolean;
  isEnded: boolean;
  blobId?: string;

  toSyncInfo(cardSelection: boolean) {
    return {
      currentPack: this.current_pack,
      confirmed: this.confirmed,
      ready: this.isReady,
      selectedCards: this.chosen_cards,
      cardSelection: cardSelection,
      commanders: this.commanders,
      units: this.units,
      heros: this.heros,
      pretenders: this.pretenders,
      magicSites: this.magicSites,
      isEnded: this.isEnded,
      blobId: this.blobId
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
    this.heros = [];
    this.isEnded = false;

  }
}
