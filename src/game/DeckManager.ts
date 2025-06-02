import {
  createDeck,
  drawCard,
  reshuffleDeck,
} from "../api/DeckOfCardsApiClient";

import { Card } from "../types/Card";

// This percentage indicates how far the cut card is placed in the combined deck of cards.
// When the cut card is reached, the cards are reshuffled on the following hand
// This is normally set between 75-80%
const CUT_CARD_PERCENTAGE = 0.775;

const DEFAULT_DECK_COUNT = 6;

/**
 * Manages the deck of cards for the Blackjack game.
 * Handles deck creation, card drawing, and reshuffling operations.
 * Implements casino-style deck management with a cut card to determine
 * when the deck should be reshuffled.
 */
export default class DeckManager {
  // The unique identifier for the deck
  private deckId: string;
  // The number of cards remaining in the deck
  private remaining: number;
  // Indicates the point at which the deck is reshuffled on the following hand
  private cutCardPosition: number;

  private constructor(deckId: string, remaining: number) {
    this.deckId = deckId;
    this.remaining = remaining;
    this.cutCardPosition = Math.round(remaining * (1 - CUT_CARD_PERCENTAGE));
  }

  /**
   * Creates and initializes a new deck manager instance.
   * Creates a new shuffled deck through the API and sets up the cut card position.
   *
   * @param deckCount - Number of decks to create (default: 6)
   * @returns A new DeckManager instance
   * @throws Error if deck creation fails
   */
  static async setup(deckCount = DEFAULT_DECK_COUNT): Promise<DeckManager> {
    try {
      const result = await createDeck(deckCount);
      return new DeckManager(result.deckId, result.remaining);
    } catch (err) {
      throw new Error("Failed to setup deck manager", { cause: err });
    }
  }

  /**
   * Draws a single card from the deck.
   * Updates the remaining card count and returns the drawn card.
   *
   * @returns The drawn card
   * @throws Error if card drawing fails or if wrong number of cards is returned
   */
  async drawCard(): Promise<Card> {
    try {
      const result = await drawCard(this.deckId);

      const { cards, remaining } = result;

      // Make sure there is only one card
      if (cards.length !== 1) {
        throw new Error(
          "Wrong number of cards drawn.  Expected 1, Received: " + cards.length
        );
      }

      // update remaining count
      this.remaining = remaining;

      return cards[0];
    } catch (err) {
      throw new Error("Failed to draw card", { cause: err });
    }
  }

  /**
   * Draws multiple cards from the deck.
   * Updates the remaining card count and returns the drawn cards.
   *
   * @param count - Number of cards to draw (default: 1)
   * @returns Array of drawn cards
   * @throws Error if card drawing fails
   */
  async drawCards(count: number = 1): Promise<Card[]> {
    try {
      const result = await drawCard(this.deckId, count);

      const { cards, remaining } = result;

      // update remaining count
      this.remaining = remaining;

      return cards;
    } catch (err) {
      throw new Error("Failed to draw cards from deck", { cause: err });
    }
  }

  /**
   * Reshuffles the deck.
   * Updates the remaining card count after reshuffling.
   *
   * @throws Error if reshuffling fails
   */
  async reshuffle() {
    try {
      const result = await reshuffleDeck(this.deckId);

      // update remaining count
      this.remaining = result.remaining;
    } catch (err) {
      throw new Error("Failed to reshuffle deck", { cause: err });
    }
  }

  /**
   * Checks if the deck should be reshuffled based on the cut card position.
   * The deck should be reshuffled when the remaining cards count is less than
   * the cut card position.
   */
  shouldReshuffle() {
    return this.remaining < this.cutCardPosition;
  }
}
