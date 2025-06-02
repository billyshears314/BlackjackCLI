import axios from "axios";
import { createDeck, drawCard, reshuffleDeck } from "./DeckOfCardsApiClient";

// Mock axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock console.error
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe("DeckOfCardsApiClient", () => {
  const mockDeckId = "test-deck-id";
  const mockRemaining = 52;
  const BASE_URL = "https://deckofcardsapi.com/api/deck";
  const NEW_SHUFFLED_DECK_URL = `${BASE_URL}/new/shuffle`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createDeck", () => {
    it("should create a new deck successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
          deck_id: mockDeckId,
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await createDeck();

      expect(result).toEqual({
        deckId: mockDeckId,
        remaining: mockRemaining,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(NEW_SHUFFLED_DECK_URL, {
        params: { deck_count: 6 },
      });
    });

    it("should throw error if API call fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(createDeck()).rejects.toThrow(
        "Error creating new deck of shuffled cards api endpoint"
      );
    });

    it("should throw error if API response is invalid", async () => {
      const mockResponse = {
        data: {
          success: false,
          deck_id: mockDeckId,
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const error = await createDeck().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe(
        "Error creating new deck of shuffled cards api endpoint"
      );
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe("API failed");
    });
  });

  describe("drawCard", () => {
    it("should draw cards successfully", async () => {
      const mockCards = [
        {
          code: "AS",
          value: "ACE",
          suit: "SPADES",
        },
        {
          code: "KH",
          value: "KING",
          suit: "HEARTS",
        },
      ];
      const mockResponse = {
        data: {
          success: true,
          cards: mockCards,
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await drawCard(mockDeckId, 2);

      expect(result).toEqual({
        cards: [
          {
            code: "AS",
            suit: "SPADES",
            rank: "A",
          },
          {
            code: "KH",
            suit: "HEARTS",
            rank: "K",
          },
        ],
        remaining: mockRemaining,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/${mockDeckId}/draw`,
        { params: { count: 2 } }
      );
    });

    it("should throw error if API call fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(drawCard(mockDeckId)).rejects.toThrow(
        "Error with drawing card(s) endpoint"
      );
    });

    it("should throw error if deckId is not specified", async () => {
      await expect(drawCard("")).rejects.toThrow("deckId is not specified");
    });

    it("should handle invalid card values", async () => {
      const mockResponse = {
        data: {
          success: true,
          cards: [
            {
              code: "XX",
              value: "INVALID",
              suit: "SPADES",
            },
          ],
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await drawCard(mockDeckId);

      expect(result).toEqual({
        cards: [],
        remaining: mockRemaining,
      });
    });
  });

  describe("reshuffleDeck", () => {
    it("should reshuffle deck successfully", async () => {
      const mockResponse = {
        data: {
          success: true,
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await reshuffleDeck(mockDeckId);

      expect(result).toEqual({
        remaining: mockRemaining,
      });
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/${mockDeckId}/shuffle`
      );
    });

    it("should throw error if API call fails", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("API Error"));

      await expect(reshuffleDeck(mockDeckId)).rejects.toThrow(
        "Error with reshuffling deck api endpoint"
      );
    });

    it("should throw error if deckId is not specified", async () => {
      await expect(reshuffleDeck("")).rejects.toThrow(
        "deckId is not specified"
      );
    });

    it("should throw error if API response is invalid", async () => {
      const mockResponse = {
        data: {
          success: false,
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const error = await reshuffleDeck(mockDeckId).catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Error with reshuffling deck api endpoint");
      expect(error.cause).toBeInstanceOf(Error);
      expect(error.cause.message).toBe("API failed");
    });
  });

  describe("normalizeCardRank", () => {
    // Since normalizeCardRank is not exported, we'll test it through drawCard
    it("should normalize face cards correctly", async () => {
      const mockResponse = {
        data: {
          success: true,
          cards: [
            { code: "AS", value: "ACE", suit: "SPADES" },
            { code: "KH", value: "KING", suit: "HEARTS" },
            { code: "QD", value: "QUEEN", suit: "DIAMONDS" },
            { code: "JC", value: "JACK", suit: "CLUBS" },
          ],
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await drawCard(mockDeckId, 4);

      expect(result?.cards.map((card) => card.rank)).toEqual([
        "A",
        "K",
        "Q",
        "J",
      ]);
    });

    it("should handle numeric cards correctly", async () => {
      const mockResponse = {
        data: {
          success: true,
          cards: [
            { code: "2S", value: "2", suit: "SPADES" },
            { code: "10H", value: "10", suit: "HEARTS" },
          ],
          remaining: mockRemaining,
        },
      };
      mockedAxios.get.mockResolvedValueOnce(mockResponse);

      const result = await drawCard(mockDeckId, 2);

      expect(result?.cards.map((card) => card.rank)).toEqual(["2", "10"]);
    });
  });
});
