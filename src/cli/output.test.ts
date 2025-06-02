import {
  printWelcome,
  printBalance,
  printCardsForPlayerTurn,
  printFinalCards,
} from "./output";
import { Card } from "../types/Card";

describe("Output Tests", () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe("printCardsForPlayerTurn", () => {
    test("should print player cards and dealer upcard", () => {
      const playerCards: Card[] = [
        { code: "AH", suit: "HEARTS", rank: "A" },
        { code: "KH", suit: "HEARTS", rank: "K" },
      ];
      const dealerUpcard: Card = { code: "7D", suit: "DIAMONDS", rank: "7" };
      const playerTotalValue = 21;
      printCardsForPlayerTurn(playerCards, playerTotalValue, dealerUpcard);
      expect(consoleSpy).toHaveBeenCalledWith(
        "Your hand: [A♥️ , K♥️ ] (Value: 21), Dealer's upcard: [7♦️ ]\n"
      );
    });
  });

  describe("printAllCards", () => {
    test("should print all cards with totals", () => {
      const playerCards: Card[] = [
        { code: "AH", suit: "HEARTS", rank: "A" },
        { code: "KH", suit: "HEARTS", rank: "K" },
      ];
      const dealerCards: Card[] = [
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      const playerTotalValue = 21;
      const dealerTotalValue = 15;
      printFinalCards(
        playerCards,
        playerTotalValue,
        dealerCards,
        dealerTotalValue
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        "Your hand: [A♥️ , K♥️ ] (Value: 21), Dealer's cards: [7♦️ , 8♦️ ] (Value: 15)\n"
      );
    });
  });
});
