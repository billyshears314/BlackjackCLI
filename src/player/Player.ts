import Participant from "../shared/Participant";
import { PlayerStorage, PlayerData } from "./storage/PlayerStorage";

// This is the amount a new player starts with in their balance when they are created
const STARTING_BALANCE: number = 100;

/**
 * Represents a player in the Blackjack game.
 */
export default class Player extends Participant {
  bet: number;

  constructor(
    private storage: PlayerStorage,
    private username: string,
    private balance: number = STARTING_BALANCE
  ) {
    super();
    this.username = username;
    this.balance = balance;
    this.bet = 0;
  }

  adjustBalance(amount: number) {
    this.balance += amount;
  }

  getBalance() {
    return this.balance;
  }

  // save player data to storage
  async save() {
    if (!this.username) {
      throw new Error("Username is invalid");
    }

    const data: PlayerData = { username: this.username, balance: this.balance };
    try {
      await this.storage.save(data);
    } catch (err: unknown) {
      throw new Error("Error saving player", { cause: err });
    }
  }
}
