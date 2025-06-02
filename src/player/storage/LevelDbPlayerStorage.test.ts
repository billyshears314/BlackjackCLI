import LevelDbPlayerStorage from "./LevelDbPlayerStorage";
import fs from "fs";
import path from "path";

const testSavedDataPath = path.resolve(__dirname, "test-savedData");

describe("LevelDbPlayerStorage", () => {
  let storage: LevelDbPlayerStorage;

  beforeEach(() => {
    // Remove old test saved data folder if it exists before each test
    if (fs.existsSync(testSavedDataPath)) {
      fs.rmSync(testSavedDataPath, { recursive: true });
    }

    storage = new LevelDbPlayerStorage(testSavedDataPath);
  });

  afterEach(async () => {
    if (storage) {
      await storage.close();
    }
  });

  afterAll(() => {
    // Remove test saved data folder if it exists after all tests
    if (fs.existsSync(testSavedDataPath)) {
      fs.rmSync(testSavedDataPath, { recursive: true });
    }
  });

  it("saves and loads a player", async () => {
    const player = { username: "testUser", balance: 42 };
    await storage.save(player);
    const loaded = await storage.load("testUser");

    expect(loaded).toEqual(player);
  });

  it("returns null when loading a non-existent player", async () => {
    const result = await storage.load("nonexistent");
    expect(result).toBeNull();
  });
});
