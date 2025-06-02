import { Card, getDisplayCode } from "../types/Card";

const formatCards = (cards: Card[]): string => {
  return cards.map((card) => getDisplayCode(card)).join(" , ");
};

const printWelcome = () => {
  console.log("Welcome to Blackjack for the Command Line!\n");
};

const printPlayerLoaded = () => {
  console.log("Player loaded");
};

const printPlayerCreated = () => {
  console.log("New player created");
};

const printBalance = (balance: number) => {
  console.log(`Your balance: $${balance}\n`);
};

// shows all the player's current cards and the upcard of the dealer
const printCardsForPlayerTurn = (
  playerCards: Card[],
  playerTotalValue: number,
  dealerUpcard: Card
) => {
  const playerCardsString = formatCards(playerCards);

  console.log(
    `Your hand: [${playerCardsString} ] (Value: ${playerTotalValue}), Dealer's upcard: [${getDisplayCode(
      dealerUpcard
    )} ]\n`
  );
};

// prints all of the player and dealer cards and their totals
const printFinalCards = (
  playerCards: Card[],
  playerTotalValue: number,
  dealerCards: Card[],
  dealerTotalValue: number
) => {
  const playerCardsString = formatCards(playerCards);
  const dealerCardsString = formatCards(dealerCards);

  console.log(
    `Your hand: [${playerCardsString} ] (Value: ${playerTotalValue}), Dealer's cards: [${dealerCardsString} ] (Value: ${dealerTotalValue})\n`
  );
};

const printPlayerBlackjack = () => {
  console.log("You have blackjack!");
};

const printDealerBlackjack = () => {
  console.log("Dealer has blackjack.");
};

const printPlayerBusted = () => {
  console.log("You busted.");
};

const printPlayerHas21 = () => {
  console.log("You have 21. Automatically stand.");
};

const printPlayerWins = (amountWon: number) => {
  console.log(`You win $${amountWon}!`);
};

const printDealerWins = () => {
  console.log(`Dealer wins.`);
};

const printPush = () => {
  console.log("Push.");
};

const printGoodbye = () => {
  console.log("Goodbye, thanks for playing!");
};

export {
  printWelcome,
  printBalance,
  printPlayerLoaded,
  printPlayerCreated,
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
};
