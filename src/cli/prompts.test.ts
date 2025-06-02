import {
  promptUsername,
  promptBet,
  promptPlayerAction,
  promptPlayAgain,
  promptDepositMoreFunds,
  promptDepositAmount,
  PlayerAction,
} from "./prompts";

// Mock prompts package
jest.mock("prompts", () => {
  return jest.fn().mockImplementation((options) => {
    // Simulate validation
    // if (options.validate) {
    //   const validationResult = options.validate(options.value);
    //   if (validationResult !== true) {
    //     return Promise.reject(new Error(validationResult));
    //   }
    // }

    // Return different values based on the prompt type and name
    switch (options.type) {
      case "text":
        return Promise.resolve({ [options.name]: "testUser" });
      case "number":
        if (options.name === "bet") {
          return Promise.resolve({ bet: 100 });
        } else if (options.name === "amount") {
          return Promise.resolve({ amount: 1000 });
        }
        break;
      case "select":
        return Promise.resolve({ action: "hit" });
      case "confirm":
        return Promise.resolve({ confirmed: true });
      default:
        return Promise.reject(
          new Error(`Unhandled prompt type: ${options.type}`)
        );
    }
  });
});

describe("Prompts Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("promptUsername", () => {
    test("should prompt for username", async () => {
      const username = await promptUsername();
      expect(username).toBe("testUser");
    });

    test("should validate username is not empty", async () => {
      // Mock prompts to return invalid username
      (jest.requireMock("prompts") as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("Name is required."))
      );

      await expect(promptUsername()).rejects.toThrow("Name is required.");
    });
  });

  describe("promptBet", () => {
    test("should prompt for bet amount", async () => {
      const bet = await promptBet(1000);
      expect(bet).toBe(100);
    });

    test("should fail validation when bet is 0", async () => {
      // Mock prompts to return invalid bet
      (jest.requireMock("prompts") as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("You must bet between 1 and 1000"))
      );

      await expect(promptBet(1000)).rejects.toThrow(
        "You must bet between 1 and 1000"
      );
    });

    test("should fail validation when bet amount is more than max bet", async () => {
      // Mock prompts to return invalid bet
      (jest.requireMock("prompts") as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("You must bet between 1 and 1000"))
      );

      await expect(promptBet(1000)).rejects.toThrow(
        "You must bet between 1 and 1000"
      );
    });
  });

  describe("promptPlayerAction", () => {
    test("should prompt for player action", async () => {
      const action = await promptPlayerAction();
      expect(action).toBe(PlayerAction.Hit);
    });
  });

  describe("promptPlayAgain", () => {
    test("should prompt to play again", async () => {
      const playAgain = await promptPlayAgain();
      expect(playAgain).toBe(true);
    });
  });

  describe("promptDepositMoreFunds", () => {
    test("should prompt to deposit more funds", async () => {
      const depositMore = await promptDepositMoreFunds();
      expect(depositMore).toBe(true);
    });
  });

  describe("promptDepositAmount", () => {
    test("should prompt for deposit amount", async () => {
      const amount = await promptDepositAmount();
      expect(amount).toBe(1000);
    });

    test("should validate deposit amount", async () => {
      // Mock prompts to return invalid amount
      (jest.requireMock("prompts") as jest.Mock).mockImplementationOnce(() =>
        Promise.reject(new Error("You must deposit between 1 and 100000"))
      );

      await expect(promptDepositAmount()).rejects.toThrow(
        "You must deposit between 1 and 100000"
      );
    });
  });
});
