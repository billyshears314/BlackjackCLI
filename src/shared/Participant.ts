/**
 * Base class for game participants (Player and Dealer).
 */
import { Card, getCardValue } from "../types/Card";

interface CardTotal {
  value: number;
  hasSoftAce: boolean;
}

export default class Participant {
  protected cards: Card[];

  constructor() {
    this.cards = [];
  }

  getCards(): Card[] {
    return this.cards;
  }

  setCards(cards: Card[]) {
    this.cards = cards;
  }

  addCard(card: Card) {
    this.cards.push(card);
  }

  // check if participant has blackjack (i.e. value of 21 with 2 cards)
  hasBlackjack() {
    const { value } = this.getCardTotal();
    return this.cards.length === 2 && value === 21;
  }

  /**
   * Calculates the total value of the participant's cards according to blackjack rules.
   *
   * Blackjack scoring rules:
   * - Number cards (2-10) are worth their face value
   * - Face cards (J, Q, K) are worth 10
   * - Aces are worth either 1 or 11, whichever gets closest to 21 without going over if possible
   *
   * @returns {CardTotal} Object containing:
   *   - value: The total value of the hand
   *   - hasSoftAce: Whether the hand contains an ace being used as 11
   */
  getCardTotal(): CardTotal {
    let numberOfAces: number = 0;
    let hasSoftAce: boolean = false;
    let totalValue: number = 0;

    // First pass: sum up all non-ace cards
    for (const card of this.cards) {
      if (card.rank === "A") {
        numberOfAces++;
      } else {
        totalValue += getCardValue(card);
      }
    }

    // Second pass: handle aces, starting from the last one
    // This ensures we only use one ace as 11 if it won't cause a bust
    for (let i = numberOfAces - 1; i >= 0; i--) {
      // Only the last ace can be worth 11, and only if it won't cause a bust
      if (i === 0 && totalValue + 11 <= 21) {
        hasSoftAce = true;
        totalValue += 11;
      } else {
        totalValue++;
      }
    }

    return {
      value: totalValue,
      hasSoftAce,
    };
  }
}
