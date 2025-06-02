import Player from "./Player";
import { PlayerStorage } from "./storage/PlayerStorage";

// Mock PlayerStorage
const mockPlayerStorage: jest.Mocked<PlayerStorage> = {
  save: jest.fn(),
  load: jest.fn(),
};

describe("Player", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a player with default starting balance", () => {
      const player = new Player(mockPlayerStorage, "testUser");
      expect(player.getBalance()).toBe(100);
      expect(player.bet).toBe(0);
    });

    it("should create a player with custom balance", () => {
      const player = new Player(mockPlayerStorage, "testUser", 500);
      expect(player.getBalance()).toBe(500);
      expect(player.bet).toBe(0);
    });
  });

  describe("adjustBalance", () => {
    it("should increase balance with positive amount", () => {
      const player = new Player(mockPlayerStorage, "testUser", 100);
      player.adjustBalance(50);
      expect(player.getBalance()).toBe(150);
    });

    it("should decrease balance with negative amount", () => {
      const player = new Player(mockPlayerStorage, "testUser", 100);
      player.adjustBalance(-30);
      expect(player.getBalance()).toBe(70);
    });

    it("should handle zero amount", () => {
      const player = new Player(mockPlayerStorage, "testUser", 100);
      player.adjustBalance(0);
      expect(player.getBalance()).toBe(100);
    });
  });

  describe("save", () => {
    it("should save player data successfully", async () => {
      const player = new Player(mockPlayerStorage, "testUser", 150);
      mockPlayerStorage.save.mockResolvedValueOnce();

      await player.save();

      expect(mockPlayerStorage.save).toHaveBeenCalledWith({
        username: "testUser",
        balance: 150,
      });
    });

    it("should throw error if username is invalid", async () => {
      const player = new Player(mockPlayerStorage, "", 100);

      await expect(player.save()).rejects.toThrow("Username is invalid");
      expect(mockPlayerStorage.save).not.toHaveBeenCalled();
    });

    it("should throw error if storage save fails", async () => {
      const player = new Player(mockPlayerStorage, "testUser", 100);
      const storageError = new Error("Storage error");
      mockPlayerStorage.save.mockRejectedValueOnce(storageError);

      const error = await player.save().catch((e) => e);
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Error saving player");
      expect(error.cause).toBe(storageError);
    });
  });
});
