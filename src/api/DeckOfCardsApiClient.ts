import axios from "axios";
import { z } from "zod";
import { Card, CardRank, CardSuit } from "../types/Card";

// Deck of Cards is a 3rd party API for creating/shuffling/drawing from decks of cards
const BASE_URL = "https://deckofcardsapi.com/api/deck";
const NEW_SHUFFLED_DECK_URL = `${BASE_URL}/new/shuffle`;

const DEFAULT_DECK_COUNT = 6;

const createDeckApiResponseSchema = z.object({
  // Whether the API call was successful */
  success: z.boolean(),
  // Deck identifier
  deck_id: z.string(),
  // The number of cards remaining in the deck */
  remaining: z.number(),
});

interface CreateDeckResult {
  // Deck identifier
  deckId: string;
  // The number of cards remaining in the deck
  remaining: number;
}

const suitSchema = z.enum(["HEARTS", "SPADES", "DIAMONDS", "CLUBS"]);

const cardSchema = z.object({
  // Two-character code representing the card, e.g., "AS" for Ace of Spades */
  code: z.string(),
  // The face value of the card, e.g., "2", "10", "JACK", "ACE" */
  value: z.string(),
  suit: suitSchema,
});

const drawCardApiResponseSchema = z.object({
  // Whether the API call was successful */
  success: z.boolean(),
  // An array of card objects drawn from the deck */
  cards: z.array(cardSchema),
  // The number of cards remaining in the deck */
  remaining: z.number(),
});

interface DrawCardResult {
  cards: Card[];
  // The number of cards remaining in the deck
  remaining: number;
}

const reshuffleDeckApiResponseSchema = z.object({
  // Whether the API call was successful
  success: z.boolean(),
  // The number of cards remaining in the deck
  remaining: z.number(),
});

interface ReshuffleDeckResult {
  // The number of cards remaining in the deck
  remaining: number;
}

/**
 * Creates a new shuffled deck of cards using the Deck of Cards API.
 *
 * @param deckCount - Number of decks to create (default: 6)
 * @returns Object containing the deck ID and remaining card count
 * @throws Error if API call fails or response is invalid
 */
const createDeck = async (
  deckCount: number = DEFAULT_DECK_COUNT
): Promise<CreateDeckResult> => {
  try {
    const { data } = await axios.get(NEW_SHUFFLED_DECK_URL, {
      params: { deck_count: deckCount },
    });

    // validate api response matches expected schema
    const parsed = createDeckApiResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid API response: " + parsed.error);
    }

    if (!parsed.data.success) {
      throw new Error("API failed");
    }

    return {
      deckId: parsed.data.deck_id,
      remaining: parsed.data.remaining,
    };
  } catch (err) {
    throw new Error("Error creating new deck of shuffled cards api endpoint", {
      cause: err,
    });
  }
};

/**
 * Draws one or more cards from the specified deck.
 *
 * @param deckId - The ID of the deck to draw from
 * @param count - Number of cards to draw (default: 1)
 * @returns Object containing the drawn cards and remaining card count
 * @throws Error if deckId is not specified, API call fails, or response is invalid
 */
const drawCard = async (
  deckId: string,
  count: number = 1
): Promise<DrawCardResult> => {
  if (!deckId) {
    throw new Error("deckId is not specified");
  }

  const DRAW_CARD_URL = `${BASE_URL}/${deckId}/draw`;

  try {
    const { data } = await axios.get(DRAW_CARD_URL, {
      params: { count },
    });

    // validate api response matches expected schema
    const parsed = drawCardApiResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid API response: " + parsed.error);
    }

    if (!parsed.data.success) {
      throw new Error("API failed");
    }

    const cards: Card[] = parsed.data.cards
      .map((card) => {
        const rank = normalizeCardRank(card.value);
        if (!rank) return null;
        return {
          code: card.code,
          suit: card.suit as CardSuit,
          rank,
        };
      })
      .filter((card): card is Card => card !== null);

    return {
      cards,
      remaining: parsed.data.remaining,
    };
  } catch (err) {
    throw new Error("Error with drawing card(s) endpoint", {
      cause: err,
    });
  }
};

/**
 * Reshuffles the specified deck of cards.
 *
 * @param deckId - The ID of the deck to reshuffle
 * @returns Object containing the remaining card count
 * @throws Error if deckId is not specified, API call fails, or response is invalid
 */
const reshuffleDeck = async (deckId: string): Promise<ReshuffleDeckResult> => {
  if (!deckId) {
    throw new Error("deckId is not specified");
  }

  const SHUFFLE_DECK_URL = `${BASE_URL}/${deckId}/shuffle`;

  try {
    const { data } = await axios.get(SHUFFLE_DECK_URL);

    // validate api response matches expected schema
    const parsed = reshuffleDeckApiResponseSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error("Invalid API response: " + parsed.error);
    }

    if (!parsed.data.success) {
      throw new Error("API failed");
    }

    return {
      remaining: parsed.data.remaining,
    };
  } catch (err) {
    throw new Error("Error with reshuffling deck api endpoint", {
      cause: err,
    });
  }
};

// Map full face card names to your expected single-letter CardRank format
const faceCardMap: Record<string, CardRank> = {
  JACK: "J",
  QUEEN: "Q",
  KING: "K",
  ACE: "A",
};

/**
 * Type guard to check if a string is a valid CardRank.
 *
 * @param value - The string to check
 * @returns true if the string is a valid card rank
 */
function isValidCardRank(value: string): value is CardRank {
  return [
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "J",
    "Q",
    "K",
    "A",
  ].includes(value);
}

/**
 * Normalizes card rank values from the API format to internal format.
 * Converts full names (e.g., "JACK") to single letters (e.g., "J").
 *
 * @param value - The card rank value from the API
 * @returns Normalized card rank or null if invalid
 */
function normalizeCardRank(value: string): CardRank | null {
  const normalized = faceCardMap[value] || value;
  return isValidCardRank(normalized) ? normalized : null;
}

export { createDeck, drawCard, reshuffleDeck };
