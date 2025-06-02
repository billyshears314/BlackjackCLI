import App from "./App";
import { Outcome, PlayerActionStatus } from "./game/GameEngine";
import LevelDbPlayerStorage from "./player/storage/LevelDbPlayerStorage";
import Player from "./player/Player";
import GameEngine from "./game/GameEngine";

// Mock the Player class
jest.mock("./player/Player", () => {
  const mockPlayer = {
    getBalance: jest.fn().mockReturnValue(100),
    save: jest.fn().mockResolvedValue(undefined),
    adjustBalance: jest.fn(),
    setCards: jest.fn(),
    getCards: jest.fn().mockReturnValue([]),
    getCardTotal: jest.fn().mockReturnValue({ value: 0 }),
    hasBlackjack: jest.fn().mockReturnValue(false),
  };

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockPlayer),
  };
});

// Mock the GameEngine class
jest.mock("./game/GameEngine", () => {
  const mockGameEngine = {
    initialize: jest.fn().mockResolvedValue(undefined),
    getPlayerBalance: jest.fn().mockReturnValue(100),
    placeBet: jest.fn(),
    dealInitialCards: jest.fn().mockResolvedValue(undefined),
    getPlayerHasBlackjack: jest.fn().mockReturnValue(false),
    getDealerHasBlackjack: jest.fn().mockReturnValue(false),
    hitPlayer: jest.fn().mockResolvedValue(undefined),
    getPlayerActionStatus: jest.fn().mockReturnValue("active"),
    playThroughDealer: jest.fn().mockResolvedValue(undefined),
    evaluateOutcome: jest.fn(),
    getOutcome: jest.fn().mockReturnValue("player_won"),
    getWinnings: jest.fn().mockReturnValue(100),
    getPlayerCards: jest.fn().mockReturnValue([]),
    getPlayerTotal: jest.fn().mockReturnValue(0),
    getDealerUpcard: jest
      .fn()
      .mockReturnValue({ code: "AS", suit: "SPADES", rank: "A" }),
    getDealerCards: jest.fn().mockReturnValue([]),
    getDealerTotal: jest.fn().mockReturnValue(0),
    checkToReshuffleDeck: jest.fn().mockResolvedValue(undefined),
    resetGame: jest.fn(),
  };

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockGameEngine),
    PlayerActionStatus: {
      Busted: "busted",
      Has_21: "has_21",
      Active: "active",
    },
    Outcome: {
      PlayerWon: "player_won",
      DealerWon: "dealer_won",
      Push: "push",
      PlayerWonWithBlackjack: "player_won_blackjack",
      DealerWonWithBlackjack: "dealer_won_blackjack",
    },
  };
});

// Mock the storage and prompts
jest.mock("./player/storage/LevelDbPlayerStorage", () => {
  const mockLoad = jest.fn();
  const mockSave = jest.fn();
  const mockClose = jest.fn();

  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      load: mockLoad,
      save: mockSave,
      close: mockClose,
    })),
  };
});

jest.mock("./cli/prompts", () => ({
  promptUsername: jest.fn(),
  promptBet: jest.fn(),
  promptPlayerAction: jest.fn(),
  promptPlayAgain: jest.fn(),
  promptDepositMoreFunds: jest.fn(),
  promptDepositAmount: jest.fn(),
  PlayerAction: {
    Hit: "HIT",
    Stand: "STAND",
  },
}));

jest.mock("./cli/output", () => ({
  printWelcome: jest.fn(),
  printPlayerCreated: jest.fn(),
  printPlayerLoaded: jest.fn(),
  printBalance: jest.fn(),
  printCards: jest.fn(),
  printAllCards: jest.fn(),
  printPlayerBlackjack: jest.fn(),
  printDealerBlackjack: jest.fn(),
  printPlayerBusted: jest.fn(),
  printPlayerHas21: jest.fn(),
  printPlayerWins: jest.fn(),
  printDealerWins: jest.fn(),
  printPush: jest.fn(),
  printGoodbye: jest.fn(),
}));

describe("App Setup Tests", () => {
  let mockStorage: jest.Mocked<LevelDbPlayerStorage>;
  let mockPlayer: jest.Mocked<Player>;
  let mockGameEngine: jest.Mocked<GameEngine>;
  let originalConsoleError: typeof console.error;
  let originalProcessExit: typeof process.exit;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Save original console.error and mock it
    originalConsoleError = console.error;
    console.error = jest.fn();

    // Save original process.exit and mock it
    originalProcessExit = process.exit;
    process.exit = jest.fn() as any;

    // Get the mock implementation
    const LevelDbPlayerStorageMock = LevelDbPlayerStorage as jest.MockedClass<
      typeof LevelDbPlayerStorage
    >;
    mockStorage =
      new LevelDbPlayerStorageMock() as jest.Mocked<LevelDbPlayerStorage>;

    // Get the mock implementation
    const PlayerMock = Player as jest.MockedClass<typeof Player>;
    mockPlayer = new PlayerMock(
      mockStorage,
      "testPlayer"
    ) as jest.Mocked<Player>;

    mockGameEngine = new GameEngine(mockPlayer) as jest.Mocked<GameEngine>;
  });

  afterEach(() => {
    // Restore console.error and process.exit
    console.error = originalConsoleError;
    process.exit = originalProcessExit;
  });

  afterAll(async () => {
    // Clean up any test data
    await mockStorage.close();
  });

  it("should create a new player when no existing player is found", async () => {
    // Mock storage to return null (no existing player)
    mockStorage.load.mockResolvedValue(null);
    mockStorage.save.mockResolvedValue(undefined);

    // Mock the username prompt
    const { promptUsername } = require("./cli/prompts");
    promptUsername.mockResolvedValue("newPlayer");

    // Create the game app
    const app = await App.setup();

    // Verify storage was checked for existing player
    expect(mockStorage.load).toHaveBeenCalledWith("newPlayer");

    // Verify a new player was created and saved
    expect(mockPlayer.save).toHaveBeenCalled();

    // Verify the game app was created with correct initial state
    expect(app).not.toBeNull();
    if (app) {
      expect(app["gameState"]).toBeDefined();
      expect(app["player"]).toBeDefined();
      expect(app["gameEngine"]).toBeDefined();
    }
  });

  it("should load an existing player when found", async () => {
    // Mock storage to return existing player data
    const existingPlayerData = {
      username: "existingPlayer",
      balance: 100,
    };
    mockStorage.load.mockResolvedValue(existingPlayerData);

    // Mock the username prompt
    const { promptUsername } = require("./cli/prompts");
    promptUsername.mockResolvedValue("existingPlayer");

    // Create the game app
    const app = await App.setup();

    // Verify storage was checked for existing player
    expect(mockStorage.load).toHaveBeenCalledWith("existingPlayer");

    // Verify no new player was saved
    expect(mockStorage.save).not.toHaveBeenCalled();

    // Verify the game app was created with correct initial state
    expect(app).not.toBeNull();
    if (app) {
      expect(app["gameState"]).toBeDefined();
      expect(app["player"]).toBeDefined();
      expect(app["gameEngine"]).toBeDefined();

      // Verify player data was loaded correctly
      expect(app["player"].getBalance()).toBe(100);
    }
  });

  it("should handle storage errors gracefully", async () => {
    // Mock storage to throw an error
    const storageError = new Error("Storage error");
    mockStorage.load.mockRejectedValue(storageError);

    // Mock the username prompt
    const { promptUsername } = require("./cli/prompts");
    promptUsername.mockResolvedValue("errorPlayer");

    // Verify setup returns null on error
    const app = await App.setup();
    expect(app).toBeNull();

    // Verify error was logged and process.exit was called
    expect(console.error).toHaveBeenCalled();
    expect(process.exit).toHaveBeenCalledWith(1);
  });
});
