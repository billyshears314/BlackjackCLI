/**
 * Represents the data structure for a player's persistent information.
 * This interface defines the shape of player data that will be stored
 * and retrieved from the storage system.
 */
export interface PlayerData {
  /** The unique identifier for the player */
  username: string;
  /** The player's current balance for placing bets */
  balance: number;
}

/**
 * Defines the contract for player data storage implementations.
 * This interface allows for different storage backends (e.g., LevelDB, in-memory)
 * to be used interchangeably while maintaining consistent behavior.
 *
 * Implementations should ensure:
 * - Data persistence between game sessions
 * - Thread-safe operations
 * - Proper error handling
 */
export interface PlayerStorage {
  /**
   * Loads player data from storage
   * @param username - The unique identifier of the player to load
   * @returns The player data if found, null if not found
   * @throws Error if the load operation fails (except for not found errors)
   */
  load(username: string): Promise<PlayerData | null>;

  /**
   * Saves player data to storage
   * @param data - The player data to save
   * @throws Error if the save operation fails
   */
  save(data: PlayerData): Promise<void>;
}
