import prompts from "prompts";

enum PlayerAction {
  Hit = "hit",
  Stand = "stand",
}

const MAX_DEPOSIT_AMOUNT = 100000;

const promptUsername = async (): Promise<string> => {
  const { username }: { username: string } = await prompts({
    type: "text",
    name: "username",
    message: "What is your name?",
    validate: (username: string) =>
      username.length > 0 ? true : "Name is required.",
  });

  return username;
};

const promptBet = async (maxBet: number): Promise<number> => {
  const { bet }: { bet: number } = await prompts({
    type: "number",
    name: "bet",
    message: "What is your bet?",
    validate: (bet: number) =>
      bet > 0 && bet <= maxBet ? true : `You must bet between 1 and ${maxBet}`,
  });

  return bet;
};

const promptPlayerAction = async (): Promise<PlayerAction> => {
  const { action }: { action: PlayerAction } = await prompts({
    type: "select",
    name: "action",
    message: "Choose your action",
    choices: [
      { title: "Hit", value: "hit" },
      { title: "Stand", value: "stand" },
    ],
  });

  return action;
};

const promptPlayAgain = async (): Promise<boolean> => {
  const { confirmed }: { confirmed: boolean } = await prompts({
    type: "confirm",
    name: "confirmed",
    message: "Do you want to keep playing?",
  });

  return confirmed;
};

const promptDepositMoreFunds = async (): Promise<boolean> => {
  const { confirmed }: { confirmed: boolean } = await prompts({
    type: "confirm",
    name: "confirmed",
    message: "Would you like to deposit more funds?",
  });

  return confirmed;
};

const promptDepositAmount = async (): Promise<number> => {
  const { amount }: { amount: number } = await prompts({
    type: "number",
    name: "amount",
    message: "How much do you want to deposit?",
    validate: (amount: number) =>
      amount > 0 && amount <= MAX_DEPOSIT_AMOUNT
        ? true
        : `You must deposit between 1 and ${MAX_DEPOSIT_AMOUNT}`,
  });

  return amount;
};

export {
  PlayerAction,
  promptUsername,
  promptPlayerAction,
  promptBet,
  promptPlayAgain,
  promptDepositMoreFunds,
  promptDepositAmount,
};
