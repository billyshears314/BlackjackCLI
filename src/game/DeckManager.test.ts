import DeckManager from "./DeckManager";
import {
  createDeck,
  drawCard,
  reshuffleDeck,
} from "../api/DeckOfCardsApiClient";
import { Card } from "../types/Card";

// Mock the API client functions
jest.mock("../api/DeckOfCardsApiClient", () => ({
  createDeck: jest.fn(),
  drawCard: jest.fn(),
  reshuffleDeck: jest.fn(),
}));

describe("DeckManager", () => {
  const mockDeckId = "test-deck-id";
  const mockRemaining = 312; // 6 decks * 52 cards
  const mockCard: Card = { code: "AS", suit: "SPADES", rank: "A" };
  const mockCard2: Card = { code: "8C", suit: "CLUBS", rank: "8" };

  const DEFAULT_DECK_COUNT = 6;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("setup", () => {
    it("should create a new deck manager with default deck count", async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });

      const deckManager = await DeckManager.setup();
      expect(deckManager).not.toBeNull();
      expect(createDeck).toHaveBeenCalledWith(DEFAULT_DECK_COUNT);
    });

    it("should create a new deck manager with specified deck count", async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: 104, // 2 decks * 52 cards
      });

      const deckManager = await DeckManager.setup(2);
      expect(deckManager).not.toBeNull();
      expect(createDeck).toHaveBeenCalledWith(2);
    });

    it("should throw error if deck creation fails", async () => {
      const apiError = new Error("API Error");
      (createDeck as jest.Mock).mockRejectedValue(apiError);

      const error = await DeckManager.setup().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to setup deck manager");
      expect(error.cause).toBe(apiError);
    });
  });

  describe("drawCard", () => {
    let deckManager: DeckManager;

    beforeEach(async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });
      deckManager = await DeckManager.setup();
    });

    it("should draw a single card successfully", async () => {
      const newRemaining = mockRemaining - 1;
      (drawCard as jest.Mock).mockResolvedValue({
        cards: [mockCard],
        remaining: newRemaining,
      });

      const card = await deckManager.drawCard();
      expect(card).toEqual(mockCard);
      expect(drawCard).toHaveBeenCalledWith(mockDeckId);
      // Verify remaining count was updated
      expect((deckManager as any).remaining).toBe(newRemaining);
    });

    it("should throw error if draw fails", async () => {
      const apiError = new Error("API Error");
      (drawCard as jest.Mock).mockRejectedValue(apiError);

      const error = await deckManager.drawCard().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to draw card");
      expect(error.cause).toBe(apiError);
    });

    it("should throw error if wrong number of cards received", async () => {
      const wrongCardsResponse = {
        cards: [mockCard, mockCard2], // Two cards instead of one
        remaining: mockRemaining - 2,
      };
      (drawCard as jest.Mock).mockResolvedValue(wrongCardsResponse);

      const error = await deckManager.drawCard().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to draw card");
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe(
        "Wrong number of cards drawn.  Expected 1, Received: 2"
      );
    });
  });

  describe("drawCards", () => {
    let deckManager: DeckManager;

    beforeEach(async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });
      deckManager = await DeckManager.setup();
    });

    it("should draw multiple cards successfully", async () => {
      const mockCards = [mockCard, mockCard2];
      (drawCard as jest.Mock).mockResolvedValue({
        cards: mockCards,
        remaining: mockRemaining - 2,
      });

      const cards = await deckManager.drawCards(2);
      expect(cards).toEqual(mockCards);
      expect(drawCard).toHaveBeenCalledWith(mockDeckId, 2);
    });

    it("should throw error if draw fails", async () => {
      const apiError = new Error("API Error");
      (drawCard as jest.Mock).mockRejectedValue(apiError);

      const error = await deckManager.drawCards(2).catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to draw cards from deck");
      expect(error.cause).toBe(apiError);
    });
  });

  describe("reshuffle", () => {
    let deckManager: DeckManager;

    beforeEach(async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });
      deckManager = await DeckManager.setup();
    });

    it("should reshuffle deck successfully", async () => {
      (reshuffleDeck as jest.Mock).mockResolvedValue({
        remaining: mockRemaining,
      });

      await deckManager.reshuffle();
      expect(reshuffleDeck).toHaveBeenCalledWith(mockDeckId);
    });

    it("should throw error if reshuffle fails", async () => {
      const apiError = new Error("API Error");
      (reshuffleDeck as jest.Mock).mockRejectedValue(apiError);

      const error = await deckManager.reshuffle().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Failed to reshuffle deck");
      expect(error.cause).toBe(apiError);
    });
  });

  describe("shouldReshuffle", () => {
    let deckManager: DeckManager;

    beforeEach(async () => {
      (createDeck as jest.Mock).mockResolvedValue({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });
      deckManager = await DeckManager.setup();
    });

    it("should return true when remaining cards are below cut card position", async () => {
      // Draw cards until we're below the cut card position
      (drawCard as jest.Mock).mockResolvedValue({
        cards: [mockCard],
        remaining: 50, // Below cut card position
      });

      await deckManager.drawCard();
      expect(deckManager.shouldReshuffle()).toBe(true);
    });

    it("should return false when remaining cards are above cut card position", async () => {
      // Initial state should be above cut card position
      expect(deckManager.shouldReshuffle()).toBe(false);
    });
  });
});
