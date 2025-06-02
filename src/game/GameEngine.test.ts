import GameEngine, { Outcome, PlayerActionStatus } from "./GameEngine";
import Player from "../player/Player";
import { Card, CardSuit, CardRank } from "../types/Card";
import DeckManager from "./DeckManager";

// Mock DeckManager
jest.mock("./DeckManager", () => {
  return {
    __esModule: true,
    default: {
      setup: jest.fn(),
    },
  };
});

describe("GameEngine Integration Tests", () => {
  let gameEngine: GameEngine;
  let player: Player;
  let mockDeckManager: jest.Mocked<DeckManager>;

  beforeEach(async () => {
    const mockPlayerStorage = {
      save: jest.fn(),
      load: jest.fn(),
    };
    player = new Player(mockPlayerStorage, "Test Player");
    gameEngine = new GameEngine(player);

    // Setup mock DeckManager
    mockDeckManager = {
      drawCard: jest.fn(),
      drawCards: jest.fn(),
      shouldReshuffle: jest.fn(),
      reshuffle: jest.fn(),
    } as unknown as jest.Mocked<DeckManager>;

    (DeckManager.setup as jest.Mock).mockResolvedValue(mockDeckManager);
    await gameEngine.initialize();
  });

  describe("Game Initialization", () => {
    test("should initialize game with correct starting state", async () => {
      expect(gameEngine.getPlayerBalance()).toBe(100); // Default starting balance
      expect(gameEngine.getPlayerCards()).toHaveLength(0);
      expect(gameEngine.getDealerCards()).toHaveLength(0);
      expect(gameEngine.getOutcome()).toBeNull();
    });

    test("should allow adding funds to player", () => {
      gameEngine.addFundsToPlayer(1000);
      expect(gameEngine.getPlayerBalance()).toBe(1100); // 100 default + 1000 added
    });

    test("should throw error if initialization fails", async () => {
      const initError = new Error("API Error");
      (DeckManager.setup as jest.Mock).mockRejectedValueOnce(initError);

      const error = await new GameEngine(player).initialize().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to initialize game engine");
      expect(error.cause).toStrictEqual(initError);
    });
  });

  describe("Betting", () => {
    beforeEach(() => {
      // No need to add funds since we have default 100
    });

    test("should place bet and deduct from balance", () => {
      gameEngine.placeBet(100);
      expect(gameEngine.getPlayerBalance()).toBe(0); // 100 default - 100 bet
    });

    test("should not allow betting more than balance", () => {
      expect(() => gameEngine.placeBet(150)).toThrow(
        "Cannot bet more than player's balance"
      );
    });
  });

  describe("Game Flow", () => {
    beforeEach(async () => {
      gameEngine.placeBet(100);
    });

    test("should deal initial cards correctly", async () => {
      const mockCards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KS", suit: "SPADES", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      mockDeckManager.drawCards.mockResolvedValueOnce(mockCards);

      await gameEngine.dealInitialCards();
      expect(gameEngine.getPlayerCards()).toHaveLength(2);
      expect(gameEngine.getDealerCards()).toHaveLength(2);
      expect(gameEngine.getDealerUpcard()).toBeDefined();
    });

    test("should throw error if deal initial cards fails", async () => {
      const dealError = new Error("Failed to draw cards");
      mockDeckManager.drawCards.mockRejectedValueOnce(dealError);

      const error = await gameEngine.dealInitialCards().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to deal initial cards");
      expect(error.cause).toStrictEqual(dealError);
    });

    test("should handle player hit correctly", async () => {
      // Setup initial cards
      const initialCards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KS", suit: "SPADES", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      mockDeckManager.drawCards.mockResolvedValueOnce(initialCards);
      await gameEngine.dealInitialCards();

      const mockCard: Card = { code: "2H", suit: "HEARTS", rank: "2" };
      mockDeckManager.drawCard.mockResolvedValueOnce(mockCard);

      await gameEngine.hitPlayer();
      expect(gameEngine.getPlayerCards()).toHaveLength(3);
    });

    test("should throw error if hit player fails", async () => {
      // Setup initial cards
      const initialCards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KS", suit: "SPADES", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      mockDeckManager.drawCards.mockResolvedValueOnce(initialCards);
      await gameEngine.dealInitialCards();

      const hitError = new Error("Failed to draw card");
      mockDeckManager.drawCard.mockRejectedValueOnce(hitError);

      const error = await gameEngine.hitPlayer().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to hit player");
      expect(error.cause).toStrictEqual(hitError);
    });

    test("should handle dealer play through correctly", async () => {
      // Setup initial cards
      const initialCards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KS", suit: "SPADES", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      mockDeckManager.drawCards.mockResolvedValueOnce(initialCards);
      await gameEngine.dealInitialCards();

      const mockCard: Card = { code: "2H", suit: "HEARTS", rank: "2" };
      mockDeckManager.drawCard.mockResolvedValue(mockCard);
      mockDeckManager.shouldReshuffle.mockReturnValue(false);

      await gameEngine.playThroughDealer();
      const dealerTotal = gameEngine.getDealerTotal();
      expect(dealerTotal).toBeGreaterThanOrEqual(17);
    });

    test("should throw error if play through dealer fails", async () => {
      // Setup initial cards
      const initialCards: Card[] = [
        { code: "AS", suit: "SPADES", rank: "A" },
        { code: "KS", suit: "SPADES", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];
      mockDeckManager.drawCards.mockResolvedValueOnce(initialCards);
      await gameEngine.dealInitialCards();

      const playError = new Error("Failed to hit dealer");
      mockDeckManager.drawCard.mockRejectedValueOnce(playError);
      mockDeckManager.shouldReshuffle.mockReturnValue(false);

      const error = await gameEngine.playThroughDealer().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failing to play through hitting dealer");
      expect(error.cause).toStrictEqual(playError);
    });
  });

  describe("Game Outcomes", () => {
    beforeEach(async () => {
      gameEngine.placeBet(100);
    });

    test("should handle player blackjack win", async () => {
      // Mock cards for player blackjack
      const playerCards: Card[] = [
        { code: "AH", suit: "HEARTS", rank: "A" },
        { code: "KH", suit: "HEARTS", rank: "K" },
      ];
      const dealerCards: Card[] = [
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];

      gameEngine["player"].setCards(playerCards);
      gameEngine["dealer"].setCards(dealerCards);

      gameEngine.evaluateOutcome();
      expect(gameEngine.getOutcome()).toBe(Outcome.PlayerWonWithBlackjack);
      expect(gameEngine.getPlayerBalance()).toBe(250); // 100 default - 100 bet + (100 * 2.5)
    });

    test("should handle dealer blackjack win", async () => {
      // Mock cards for dealer blackjack
      const playerCards: Card[] = [
        { code: "7H", suit: "HEARTS", rank: "7" },
        { code: "8H", suit: "HEARTS", rank: "8" },
      ];
      const dealerCards: Card[] = [
        { code: "AD", suit: "DIAMONDS", rank: "A" },
        { code: "KD", suit: "DIAMONDS", rank: "K" },
      ];

      gameEngine["player"].setCards(playerCards);
      gameEngine["dealer"].setCards(dealerCards);

      gameEngine.evaluateOutcome();
      expect(gameEngine.getOutcome()).toBe(Outcome.DealerWonWithBlackjack);
    });

    test("should handle player bust", async () => {
      // Mock cards for player bust
      const playerCards: Card[] = [
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "7H", suit: "HEARTS", rank: "7" },
        { code: "5H", suit: "HEARTS", rank: "5" },
      ];
      const dealerCards: Card[] = [
        { code: "7D", suit: "DIAMONDS", rank: "7" },
        { code: "8D", suit: "DIAMONDS", rank: "8" },
      ];

      gameEngine["player"].setCards(playerCards);
      gameEngine["dealer"].setCards(dealerCards);

      gameEngine.evaluateOutcome();
      expect(gameEngine.getOutcome()).toBe(Outcome.DealerWon);
    });

    test("should handle push", async () => {
      // Mock cards for push
      const playerCards: Card[] = [
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "7H", suit: "HEARTS", rank: "7" },
      ];
      const dealerCards: Card[] = [
        { code: "KD", suit: "DIAMONDS", rank: "K" },
        { code: "7D", suit: "DIAMONDS", rank: "7" },
      ];

      gameEngine["player"].setCards(playerCards);
      gameEngine["dealer"].setCards(dealerCards);

      gameEngine.evaluateOutcome();
      expect(gameEngine.getOutcome()).toBe(Outcome.Push);
      expect(gameEngine.getPlayerBalance()).toBe(100); // 100 default - 100 bet + 100 returned
    });
  });

  describe("Player Action Status", () => {
    test("should return correct status for bust", () => {
      const playerCards: Card[] = [
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "7H", suit: "HEARTS", rank: "7" },
        { code: "5H", suit: "HEARTS", rank: "5" },
      ];
      gameEngine["player"].setCards(playerCards);
      expect(gameEngine.getPlayerActionStatus()).toBe(
        PlayerActionStatus.Busted
      );
    });

    test("should return correct status for 21", () => {
      const playerCards: Card[] = [
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "AH", suit: "HEARTS", rank: "A" },
      ];
      gameEngine["player"].setCards(playerCards);
      expect(gameEngine.getPlayerActionStatus()).toBe(
        PlayerActionStatus.Has_21
      );
    });

    test("should return correct status for active hand", () => {
      const playerCards: Card[] = [
        { code: "KH", suit: "HEARTS", rank: "K" },
        { code: "7H", suit: "HEARTS", rank: "7" },
      ];
      gameEngine["player"].setCards(playerCards);
      expect(gameEngine.getPlayerActionStatus()).toBe(
        PlayerActionStatus.Active
      );
    });
  });
});
