export type CardSuit = "HEARTS" | "CLUBS" | "DIAMONDS" | "SPADES";

export type CardRank =
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K"
  | "A";

export interface Card {
  code: string;
  suit: CardSuit;
  rank: CardRank;
}

// Utility function to get the card's value
export function getCardValue(card: Card): number {
  if (card.rank === "A") return 11; // Ace is 11 by default but treated specially
  if (["J", "Q", "K"].includes(card.rank)) return 10;
  return parseInt(card.rank); // '2'..'10' convert to number
}

export function getDisplayCode(card: Card): string {
  switch (card.suit) {
    case "HEARTS":
      return `${card.rank}♥️`;
    case "CLUBS":
      return `${card.rank}♣️`;
    case "DIAMONDS":
      return `${card.rank}♦️`;
    case "SPADES":
      return `${card.rank}♠️`;
  }
}
