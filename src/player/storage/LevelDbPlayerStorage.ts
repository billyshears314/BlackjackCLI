import { Level } from "level";
import { PlayerStorage, PlayerData } from "./PlayerStorage";

/**
 * Implementation of PlayerStorage using LevelDB for persistent storage.
 * LevelDB is a fast key-value storage library that stores data on disk.
 * This implementation uses JSON encoding for values, allowing us to store
 * complex PlayerData objects directly.
 */
export default class LevelDbPlayerStorage implements PlayerStorage {
  /** The LevelDB database instance */
  private db: Level<string, any>;

  /**
   * Creates a new LevelDB storage instance
   * @param saveDataFilePath - Path where the LevelDB files will be stored (default: "./savedData")
   */
  constructor(saveDataFilePath = "./savedData") {
    this.db = new Level<string, any>(saveDataFilePath, {
      valueEncoding: "json",
    });
  }

  /**
   * Saves player data to the database
   * @param player - The player data to save
   * @throws Error if the save operation fails
   */
  async save(player: PlayerData): Promise<void> {
    if (!player || !player.username) {
      throw new Error("Invalid player data");
    }
    // Use player:username as the key to namespace player data
    await this.db.put(`player:${player.username}`, player);
  }

  /**
   * Loads player data from the database
   * @param username - The username of the player to load
   * @returns The player data if found, null if not found
   * @throws Error if the load operation fails (except for not found errors)
   */
  async load(username: string): Promise<PlayerData | null> {
    if (!username) {
      throw new Error("Username is required");
    }

    try {
      const player = await this.db.get(`player:${username}`);
      if (!player || typeof player !== "object") {
        return null;
      }
      return player as PlayerData;
    } catch (err: any) {
      // LevelDB throws a notFound error when the key doesn't exist
      if (err.notFound) return null;
      throw err;
    }
  }

  /**
   * Closes the database connection
   * This is primarily needed for cleanup in tests to ensure
   * the database is properly closed before the process exits
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
    }
  }
}
