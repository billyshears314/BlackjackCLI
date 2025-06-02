import Participant from "./Participant"; // adjust path as needed
import { Card } from "../types/Card";

describe("Participant Class", () => {
  let participant: Participant;

  beforeEach(() => {
    participant = new Participant();
  });

  describe("getCardTotal", () => {
    test("returns correct total for simple hand without Aces", () => {
      const cards: Card[] = [
        { code: "0H", suit: "HEARTS", rank: "10" },
        { code: "7S", suit: "SPADES", rank: "7" },
      ];
      participant.setCards(cards);

      expect(participant.getCardTotal()).toEqual({
        value: 17,
        hasSoftAce: false,
      });
    });

    test("counts one Ace as 11 if it doesn't bust", () => {
      const cards: Card[] = [
        { code: "AC", suit: "CLUBS", rank: "A" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
      ];
      participant.setCards(cards);

      expect(participant.getCardTotal()).toEqual({
        value: 18,
        hasSoftAce: true,
      });
    });

    test("counts Ace as 1 if 11 would bust", () => {
      const cards: Card[] = [
        { code: "AC", suit: "CLUBS", rank: "A" },
        { code: "0S", suit: "SPADES", rank: "10" },
        { code: "5D", suit: "DIAMONDS", rank: "5" },
      ];
      participant.setCards(cards);

      expect(participant.getCardTotal()).toEqual({
        value: 16,
        hasSoftAce: false,
      });
    });

    test("correctly handles multiple Aces", () => {
      const cards: Card[] = [
        { code: "AC", suit: "CLUBS", rank: "A" },
        { code: "AH", suit: "HEARTS", rank: "A" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      participant.setCards(cards);

      expect(participant.getCardTotal()).toEqual({
        value: 20,
        hasSoftAce: true,
      });
    });

    test("treats all Aces as 1 if using 11 would bust", () => {
      const cards: Card[] = [
        { code: "AC", suit: "CLUBS", rank: "A" },
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "9H", suit: "HEARTS", rank: "9" },
        { code: "9D", suit: "DIAMONDS", rank: "9" },
      ];
      participant.setCards(cards);

      expect(participant.getCardTotal()).toEqual({
        value: 20,
        hasSoftAce: false,
      });
    });
  });

  describe("hasBlackjack", () => {
    test("returns true for blackjack with Ace and 10", () => {
      const cards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KH", suit: "HEARTS", rank: "K" },
      ];
      participant.setCards(cards);

      expect(participant.hasBlackjack()).toBe(true);
    });

    test("returns false for non-blackjack total of 21 with more than 2 cards", () => {
      const cards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "QD", suit: "DIAMONDS", rank: "Q" },
      ];
      participant.setCards(cards);

      expect(participant.hasBlackjack()).toBe(false);
    });

    test("returns false for two non-blackjack cards", () => {
      const cards: Card[] = [
        { code: "9C", suit: "CLUBS", rank: "9" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      participant.setCards(cards);

      expect(participant.hasBlackjack()).toBe(false);
    });

    test("returns false if only one card", () => {
      const cards: Card[] = [{ code: "AC", suit: "CLUBS", rank: "A" }];
      participant.setCards(cards);

      expect(participant.hasBlackjack()).toBe(false);
    });
  });
});
