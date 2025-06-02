import GameEngine, { Outcome, PlayerActionStatus } from "./game/GameEngine";
import Player from "./player/Player";

import {
  PlayerAction,
  promptUsername,
  promptBet,
  promptPlayerAction,
  promptPlayAgain,
  promptDepositMoreFunds,
  promptDepositAmount,
} from "./cli/prompts";
import {
  printWelcome,
  printPlayerCreated,
  printPlayerLoaded,
  printBalance,
  printCardsForPlayerTurn,
  printFinalCards,
  printPlayerBlackjack,
  printDealerBlackjack,
  printPlayerBusted,
  printPlayerHas21,
  printPlayerWins,
  printDealerWins,
  printPush,
  printGoodbye,
} from "./cli/output";
import LevelDbPlayerStorage from "./player/storage/LevelDbPlayerStorage";

// Game states that control the flow of the blackjack game
enum GameState {
  // Initial setup state
  INITIAL_GAME,
  // Player places bet
  BET_BEFORE_ROUND,
  // Initial cards are dealt
  INITIAL_ROUND,
  // Player's turn to hit or stand
  PLAYER_TURN,
  // Dealer's turn is played out
  DEALER_TURN,
  // Round completion and payouts
  ROUND_END,
  // Game exit state
  EXIT,
}

/**
 * Main application class that manages the blackjack game flow.
 * Handles game state transitions, user interactions, and directs the game engine
 */
export default class App {
  gameState: GameState;

  private constructor(private gameEngine: GameEngine, private player: Player) {
    this.gameState = GameState.INITIAL_GAME;
  }

  /**
   * Setup prompts the player for their name,
   * creates the Player and GameEngine instances,
   * then returns a ready-to-run App instance.
   */
  static async setup(): Promise<App | null> {
    let player: Player;
    const playerStorage = new LevelDbPlayerStorage();

    printWelcome();
    const username = await promptUsername();
    try {
      const playerData = await playerStorage.load(username);

      if (playerData) {
        printPlayerLoaded();
        player = new Player(playerStorage, username, playerData.balance);
      } else {
        printPlayerCreated();
        player = new Player(playerStorage, username);
        await player.save();
      }

      const engine = new GameEngine(player);
      return new App(engine, player);
    } catch (err) {
      handleError(
        new Error("Failed to load or save player data", { cause: err })
      );
      return null;
    }
  }

  /**
   * Main game loop that manages the game state machine.
   * Handles transitions between different game states and coordinates
   * game actions based on the current state.
   */
  async run(): Promise<void> {
    while (true) {
      switch (this.gameState) {
        case GameState.INITIAL_GAME:
          try {
            await this.gameEngine.initialize();
          } catch (err) {
            handleError(err);
          }

          this.showBalance();
          this.gameState = GameState.BET_BEFORE_ROUND;
          break;
        case GameState.BET_BEFORE_ROUND:
          const playerBalance = this.gameEngine.getPlayerBalance();

          // check if player has any funds to bet
          if (playerBalance === 0) {
            // prompt to get more funds
            const success = await this.retrieveMoreFunds();
            // Exit if funds aren't added
            if (!success) this.gameState = GameState.EXIT;
            // Return to start of BET_BEFORE_ROUND state
            break;
          }

          const bet = await promptBet(playerBalance);
          try {
            this.gameEngine.placeBet(bet);
          } catch (err) {
            handleError(
              new Error("Unexpected error with placing bet", { cause: err })
            );
          }

          this.gameState = GameState.INITIAL_ROUND;
          break;
        case GameState.INITIAL_ROUND:
          try {
            await this.gameEngine.dealInitialCards();
          } catch (err) {
            handleError(err);
          }

          this.showCardsForPlayerTurn();

          this.gameState = GameState.PLAYER_TURN;
          break;
        case GameState.PLAYER_TURN:
          // skip ahead to dealer turn if player has blackjack
          if (this.gameEngine.getPlayerHasBlackjack()) {
            printPlayerBlackjack();
            this.gameState = GameState.DEALER_TURN;
            break;
          }

          // skip ahead to dealer end of round if dealer has blackjack
          if (this.gameEngine.getDealerHasBlackjack()) {
            printDealerBlackjack();
            this.gameState = GameState.ROUND_END;
            break;
          }

          const action = await promptPlayerAction();

          if (action === PlayerAction.Hit) {
            try {
              await this.gameEngine.hitPlayer();
            } catch (err) {
              handleError(err);
            }

            this.showCardsForPlayerTurn();

            const playerActionStatus = this.gameEngine.getPlayerActionStatus();

            if (playerActionStatus === PlayerActionStatus.Busted) {
              printPlayerBusted();
              this.gameState = GameState.DEALER_TURN;
            } else if (playerActionStatus === PlayerActionStatus.Has_21) {
              printPlayerHas21();
              this.gameState = GameState.DEALER_TURN;
            }
          } else if (action === PlayerAction.Stand) {
            this.gameState = GameState.DEALER_TURN;
          }

          break;
        case GameState.DEALER_TURN:
          try {
            // continue dealing cards to dealer using standard blackjack rules until they are done
            await this.gameEngine.playThroughDealer();
          } catch (err) {
            handleError(err);
          }

          this.gameState = GameState.ROUND_END;
          break;

        case GameState.ROUND_END:
          this.showFinalCards();

          // evaluate outcome
          this.gameEngine.evaluateOutcome();
          const outcome = this.gameEngine.getOutcome();

          if (outcome === null) {
            handleError(new Error("outcome unable to be determined"));
          }

          const winnings = this.gameEngine.getWinnings();
          if (winnings === null) {
            handleError(new Error("player winnings unable to be determined"));
          }

          switch (outcome) {
            case Outcome.PlayerWonWithBlackjack:
            case Outcome.PlayerWon:
              printPlayerWins(winnings as number);
              break;
            case Outcome.DealerWonWithBlackjack:
            case Outcome.DealerWon:
              printDealerWins();
              break;
            case Outcome.Push:
              printPush();
              break;
          }

          this.showBalance();
          const playAgain = await promptPlayAgain();
          if (playAgain) {
            this.gameState = GameState.BET_BEFORE_ROUND;
            try {
              await this.gameEngine.checkToReshuffleDeck();
            } catch (err) {
              handleError(err);
            }
          } else {
            this.gameState = GameState.EXIT;
          }

          this.gameEngine.resetGame();
          break;
      }

      if (this.gameState === GameState.EXIT) {
        printGoodbye();
        return;
      }
    }
  }

  // helper function to print cards for player turn by retrieving data from game engine
  showCardsForPlayerTurn = () => {
    const playerCards = this.gameEngine.getPlayerCards();
    const playerTotal = this.gameEngine.getPlayerTotal();
    const dealerUpcard = this.gameEngine.getDealerUpcard();

    if (!dealerUpcard) {
      handleError(new Error("dealer upcard unable to be determined"));
      return;
    }

    printCardsForPlayerTurn(playerCards, playerTotal, dealerUpcard);
  };

  // helper function to print final cards by retrieving data from game engine
  showFinalCards = () => {
    const playerCards = this.gameEngine.getPlayerCards();
    const playerTotal = this.gameEngine.getPlayerTotal();
    const dealerCards = this.gameEngine.getDealerCards();
    const dealerTotal = this.gameEngine.getDealerTotal();

    printFinalCards(playerCards, playerTotal, dealerCards, dealerTotal);
  };

  // helper function to print balance by retrieving player balance from game engine
  showBalance = () => {
    const balance = this.gameEngine.getPlayerBalance();
    printBalance(balance);
  };

  // prompt chain of asking if player wants to deposit funds and how much
  retrieveMoreFunds = async (): Promise<boolean> => {
    const depositMoreFunds = await promptDepositMoreFunds();
    if (!depositMoreFunds) return false;

    const amount = await promptDepositAmount();
    this.gameEngine.addFundsToPlayer(amount);

    return true;
  };
}

/**
 * Logs an error and its full chain of causes to the console in a readable, indented format,
 * then exits the process with a failure code.
 *
 * This function handles nested errors using the standard `cause` property introduced in ES2022.
 * It prints the main error first, then recursively prints each cause with increasing indentation,
 * helping to trace the root problem in a structured way.
 *
 * @param err - The error to handle, which may be of unknown type.
 *
 * Example output:
 *  Error: Failed to load or save player data
 *    Cause: Error saving player
 *      Cause: Invalid player data
 */
const handleError = (err: unknown) => {
  const printErrorChain = (error: unknown, level: number = 0) => {
    if (error instanceof Error) {
      const indent = "  ".repeat(level);
      if (level === 0) {
        console.error(`${indent} Error: ${error.message}`);
      } else {
        console.error(`${indent} Cause: ${error.message}`);
      }

      if ((error as any).cause) {
        printErrorChain((error as any).cause, level + 1);
      }
    } else {
      console.error("Unknown error:", error);
    }
  };

  printErrorChain(err);
  console.log("\nTry running program again.");
  process.exit(1);
};
