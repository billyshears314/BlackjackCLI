import DeckManager from "./DeckManager";
import Dealer from "./Dealer";
import Player from "../player/Player";
import { Card } from "../types/Card";

/**
 * Represents the possible outcomes of a Blackjack hand.
 */
export enum Outcome {
  PlayerWon = "player_won",
  DealerWon = "dealer_won",
  Push = "push",
  PlayerWonWithBlackjack = "player_won_blackjack",
  DealerWonWithBlackjack = "dealer_won_blackjack",
}

/**
 * Represents the current status of the player's hand.
 */
export enum PlayerActionStatus {
  Busted = "busted",
  Has_21 = "has_21",
  Active = "active",
}

/**
 * Core game engine that manages the Blackjack game state and logic.
 * Handles card dealing, player actions, dealer play, and outcome evaluation.
 */
export default class GameEngine {
  private deckManager: DeckManager | null;
  private dealer: Dealer;
  // The outcome of the last round
  private outcome: Outcome | null;
  // Amount won/lost in last round
  private winnings: number | null;

  constructor(private player: Player) {
    this.deckManager = null;
    this.dealer = new Dealer();
    this.outcome = null;
    this.winnings = null;
  }

  /**
   * Initializes the game engine by setting up the deck manager.
   * @throws Error if deck initialization fails
   */
  async initialize() {
    // setup deck manager with deck of cards
    try {
      const deckManager = await DeckManager.setup();
      this.deckManager = deckManager;
    } catch (err) {
      throw new Error("Failed to initialize game engine", { cause: err });
    }
  }

  /**
   * Adjusts the player's balance by the specified amount.
   * @param amount - The amount to adjust (positive for adding, negative for subtracting)
   */
  adjustPlayerBalance(amount: number) {
    this.player.adjustBalance(amount);
  }

  /**
   * Draws a single card from the deck.
   * @returns The drawn card
   * @throws Error if deck manager is undefined or card drawing fails
   */
  async drawCard(): Promise<Card> {
    if (!this.deckManager) {
      throw new Error("Deck Manager undefined");
    }

    try {
      const card = await this.deckManager.drawCard();
      return card;
    } catch (err) {
      throw new Error("Failed to draw card", { cause: err });
    }
  }

  /**
   * Draws multiple cards from the deck.
   * @param count - Number of cards to draw
   * @returns Array of drawn cards
   * @throws Error if deck manager is undefined or card drawing fails
   */
  async drawCards(count: number): Promise<Card[]> {
    if (!this.deckManager) {
      throw new Error("Deck Manager undefined");
    }

    try {
      const cards = await this.deckManager.drawCards(count);
      return cards;
    } catch (err) {
      throw new Error("Failed to draw cards", { cause: err });
    }
  }

  /**
   * Deals initial cards to both player and dealer.
   * Draws four cards at once to minimize API calls.
   * @throws Error if dealing cards fails
   */
  async dealInitialCards() {
    try {
      // grab all four cards at once for player/dealer to reduce extra API calls
      const cards = await this.drawCards(4);

      if (!cards) return true;

      const playerCards = cards.slice(0, 2);
      const dealerCards = cards.slice(2);

      this.player.setCards(playerCards);
      this.dealer.setCards(dealerCards);
    } catch (err) {
      throw new Error("Failed to deal initial cards", { cause: err });
    }
  }

  /**
   * Checks if the deck should be reshuffled and performs reshuffling if necessary.
   * @throws Error if deck manager is undefined or reshuffling fails
   */
  async checkToReshuffleDeck() {
    if (!this.deckManager) {
      throw new Error("Deck Manager undefined");
    }

    if (this.deckManager.shouldReshuffle()) {
      try {
        await this.deckManager.reshuffle();
      } catch (err) {
        throw new Error("Failed to reshuffle deck", { cause: err });
      }
    }
  }

  /**
   * Places a bet for the player and deducts it from their balance.
   * @param bet - The amount to bet
   * @throws Error if bet amount exceeds player's balance
   */
  placeBet(bet: number) {
    if (bet > this.player.getBalance()) {
      throw new Error("Cannot bet more than player's balance");
    }
    this.player.bet = bet;
    // subtract bet from player's balance
    this.player.adjustBalance(-bet);
  }

  addFundsToPlayer(amount: number) {
    this.player.adjustBalance(amount);
  }

  getPlayerCards(): Card[] {
    return this.player.getCards();
  }

  // Gets the total value of the player's hand.
  getPlayerTotal(): number {
    const { value } = this.player.getCardTotal();
    return value;
  }

  // Gets the dealer's upcard (first visible card).
  getDealerUpcard(): Card | null {
    return this.dealer.getUpcard();
  }

  getDealerCards(): Card[] {
    return this.dealer.getCards();
  }

  // Gets the total value of the dealer's hand.
  getDealerTotal(): number {
    const { value } = this.dealer.getCardTotal();
    return value;
  }

  getPlayerBalance(): number {
    return this.player.getBalance();
  }

  getPlayerHasBlackjack(): boolean {
    return this.player.hasBlackjack();
  }

  getDealerHasBlackjack(): boolean {
    return this.dealer.hasBlackjack();
  }

  /**
   * Gets the amount won or lost in the last round.
   * @returns The winnings amount or null if no round has been played
   */
  getWinnings(): number | null {
    return this.winnings;
  }

  /**
   * Determines the current status of the player's hand.
   * @returns PlayerActionStatus indicating if player has busted, has 21, or is still active
   */
  getPlayerActionStatus(): PlayerActionStatus {
    const { value } = this.player.getCardTotal();

    if (value > 21) {
      return PlayerActionStatus.Busted;
    } else if (value === 21) {
      return PlayerActionStatus.Has_21;
    }

    return PlayerActionStatus.Active;
  }

  /**
   * Adds a card to the player's hand.
   * @throws Error if drawing card fails
   */
  async hitPlayer() {
    try {
      const card = await this.drawCard();
      if (!card) return;
      this.player.addCard(card);
    } catch (err) {
      throw new Error("Failed to hit player", { cause: err });
    }
  }

  /**
   * Adds a card to the dealer's hand.
   * @throws Error if drawing card fails
   */
  async hitDealer() {
    try {
      const card = await this.drawCard();
      if (!card) return;
      this.dealer.addCard(card);
    } catch (err) {
      throw new Error("Failed to hit dealer", { cause: err });
    }
  }

  /**
   * Plays through the dealer's turn according to standard rules.
   * Dealer must hit on 16 and below, stand on 17 and above.
   * @throws Error if dealer play fails
   */
  async playThroughDealer() {
    while (this.dealer.shouldHit()) {
      try {
        await this.hitDealer();
      } catch (err) {
        throw new Error("Failing to play through hitting dealer", {
          cause: err,
        });
      }
    }
  }

  /**
   * Evaluates the outcome of the hand and applies the appropriate payout.
   * Determines if player or dealer won and what kind of win it was
   * (e.g., blackjack, normal, push).
   */
  evaluateOutcome(): void {
    const { value: playerTotal } = this.player.getCardTotal();
    const { value: dealerTotal } = this.dealer.getCardTotal();

    const playerHasBlackjack = this.player.hasBlackjack();
    const dealerHasBlackjack = this.dealer.hasBlackjack();

    if (playerHasBlackjack && !dealerHasBlackjack) {
      this.outcome = Outcome.PlayerWonWithBlackjack;
    } else if (dealerHasBlackjack && !playerHasBlackjack) {
      this.outcome = Outcome.DealerWonWithBlackjack;
      // player busted - it doesn't matter if dealer also busted, the dealer wins if the player busted
    } else if (playerTotal > 21) {
      this.outcome = Outcome.DealerWon;
      // dealer busted
    } else if (dealerTotal > 21) {
      this.outcome = Outcome.PlayerWon;
    } else if (playerTotal > dealerTotal) {
      this.outcome = Outcome.PlayerWon;
    } else if (dealerTotal > playerTotal) {
      this.outcome = Outcome.DealerWon;
    } else {
      this.outcome = Outcome.Push;
    }

    this.applyPayout();
  }

  /**
   * Gets the outcome of the last round.
   * @returns The outcome of the last round or null if no round has been played
   */
  getOutcome(): Outcome | null {
    return this.outcome;
  }

  /**
   * Applies the payout based on the outcome of the hand.
   * Payout rules:
   * - Blackjack: 3:2 payout (1.5x bet)
   * - Regular win: 1:1 payout (1x bet)
   * - Push: Return original bet
   * - Loss: No payout
   */
  private applyPayout() {
    const bet = this.player.bet;
    let payout = 0;

    switch (this.outcome) {
      case Outcome.PlayerWonWithBlackjack:
        // Player gets their bet back plus 1.5x their bet
        payout = bet + bet * 1.5;
        break;
      case Outcome.PlayerWon:
        // Player gets their bet back plus 1x their bet
        payout = bet + bet;
        break;
      case Outcome.Push:
        // Player gets their bet back
        payout = bet;
        break;
      case Outcome.DealerWon:
      case Outcome.DealerWonWithBlackjack:
        // Player loses their bet
        payout = 0;
        break;
    }

    this.winnings = payout;
    this.adjustPlayerBalance(payout);
    this.player.save();
  }

  // Resets outcome and winnings for a new round
  resetGame() {
    this.outcome = null;
    this.winnings = null;
  }
}
