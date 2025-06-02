import Participant from "../shared/Participant";
import { Card } from "../types/Card";

/**
 * Represents the dealer in a game of Blackjack.
 */
export default class Dealer extends Participant {
  constructor() {
    super();
  }

  /**
   * Returns the dealer's upcard — the first card in their hand.
   * In Blackjack, only the first (face-up) card is visible to players initially.
   * Returns null if no cards have been dealt yet.
   */
  getUpcard(): Card | null {
    return this.cards.length > 0 ? this.cards[0] : null;
  }

  /**
   * Determines whether the dealer should hit (draw another card).
   * Follows standard Blackjack dealer rules: hit on totals less than 17,
   * and also on soft 17 (a total of 17 that includes an Ace counted as 11).
   */
  shouldHit(): boolean {
    const { value, hasSoftAce } = this.getCardTotal();

    return value < 17 || (value === 17 && hasSoftAce);
  }
}
