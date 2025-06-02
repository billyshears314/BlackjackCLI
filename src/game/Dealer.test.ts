import Dealer from "./Dealer"; // adjust path if needed
import { Card } from "../types/Card";

describe("Dealer class", () => {
  let dealer: Dealer;

  beforeEach(() => {
    dealer = new Dealer();
  });

  describe("getUpcard", () => {
    it("returns null if dealer has no cards", () => {
      expect(dealer.getUpcard()).toBeNull();
    });

    it("returns the first card if dealer has cards", () => {
      const card1: Card = { rank: "7", suit: "SPADES", code: "7S" };
      const card2: Card = { rank: "K", suit: "HEARTS", code: "KH" };
      dealer.setCards([card1, card2]);

      expect(dealer.getUpcard()).toEqual(card1);
    });
  });

  describe("shouldHit", () => {
    it("returns true if total value is less than 17", () => {
      // 6 + 9 = 15
      dealer.setCards([
        { rank: "6", suit: "CLUBS", code: "6C" },
        { rank: "9", suit: "DIAMONDS", code: "9D" },
      ]);

      expect(dealer.shouldHit()).toBe(true);
    });

    it("returns true if total value is 17 and has a soft ace", () => {
      // Ace + 6 = 17 (soft)
      dealer.setCards([
        { rank: "A", suit: "HEARTS", code: "AH" },
        { rank: "6", suit: "SPADES", code: "6S" },
      ]);

      expect(dealer.shouldHit()).toBe(true);
    });

    it("returns false if total value is 17 but no soft ace (hard 17)", () => {
      // 10 + 7 = 17 (hard)
      dealer.setCards([
        { rank: "10", suit: "HEARTS", code: "0H" },
        { rank: "7", suit: "DIAMONDS", code: "7D" },
      ]);

      expect(dealer.shouldHit()).toBe(false);
    });

    it("returns false if total value is greater than 17", () => {
      // 10 + 8 = 18
      dealer.setCards([
        { rank: "10", suit: "HEARTS", code: "0H" },
        { rank: "8", suit: "CLUBS", code: "8C" },
      ]);

      expect(dealer.shouldHit()).toBe(false);
    });
  });
});
