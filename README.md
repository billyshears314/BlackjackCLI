# Blackjack CLI Game

A command-line implementation of the classic casino game Blackjack

## Setup/Run

### Prerequisites

- Node.js (v16.9.0 or higher) - Required for Error.cause support (ES2022 feature)
- npm (v8.0.0 or higher) - Required for modern dependency resolution and TypeScript support

### Installation

Install dependencies:

```bash
npm install
```

### Commands

The project uses TypeScript and includes several npm scripts for development:

- `npm run dev`: Run the application in development mode
- `npm run build`: Compile TypeScript to JavaScript
- `npm start`: Run compiled build
- `npm test`: Run the test suite

### Running the Game

#### Run in Dev Mode

```bash
npm run dev
```

#### Build and Run

1. Build the project:

```bash
npm run build
```

2. Start the game:

```bash
npm start
```

### Testing

Run the test suite:

```bash
npm test
```

## Design Decisions

I used a class-based approach to designing the game. I thought the game lended itself well to breaking things out in this way (e.g. Player, Dealer, DeckManager, etc.). I decided on breaking up the game into different game states to handle different sections of the flow of a game, I thought this helped reason about the code better. And I decided on making App the coordinator between game state, handling input/output from the terminal, and directing updates to the game engine.

I decided to use LevelDB for storing player data as key/values (username: playerData). I wanted something simple (so I didn't think a DB was necessary for this) and I had thought of just reading/writing to a json file, but I wanted something with better performance than having to read/write an entire file which may not but potentially could grow large. I also decided to make the storage implement an interface for this so that it would be easy to add/change the type of storage used if I wanted to in the future.

For error handling, I decided to throw errors up the chain to the App class and handle them by outputting the error messages encountered across the chain and exiting the program. If I spent more time working on this, I would work on making some types of errors recoverable. For example, I could retry API calls that could have failed for network error reasons.

## Assumptions

- Terminal supports Unicode card symbols
- If a user runs out of funds, they may deposit up to $100,000 more into their account.

## Example Output (Full Game Session)

```bash
Welcome to Blackjack for the Command Line!

√ What is your name? ... Alex
New player created
Your balance: $100

√ What is your bet? ... 25
Your hand: [2♦️, 3♠️] (Value: 5), Dealer's upcard: [10♠️]

√ Choose your action » Hit
Your hand: [2♦️, 3♠️, 7♠️] (Value: 12), Dealer's upcard: [10♠️]

√ Choose your action » Hit
Your hand: [2♦️, 3♠️, 7♠️, 3♦️] (Value: 15), Dealer's upcard: [10♠️]

√ Choose your action » Stand
Your hand: [2♦️, 3♠️, 7♠️, 3♦️] (Value: 15), Dealer's cards: [10♠️, 6♠️, 9♦️] (Value: 25)

You win $25!
Your balance: $125

√ Do you want to keep playing? ... yes
√ What is your bet? ... 25
Your hand: [4♥️, 4♣️] (Value: 8), Dealer's upcard: [6♦️]

√ Choose your action » Hit
Your hand: [4♥️, 4♣️, 2♠️] (Value: 10), Dealer's upcard: [6♦️]

√ Choose your action » Hit
Your hand: [4♥️, 4♣️, 2♠️, 2♠️] (Value: 12), Dealer's upcard: [6♦️]

√ Choose your action » Hit
Your hand: [4♥️, 4♣️, 2♠️, 2♠️, 3♠️] (Value: 15), Dealer's upcard: [6♦️]

√ Choose your action » Hit
Your hand: [4♥️, 4♣️, 2♠️, 2♠️, 3♠️, 4♣️] (Value: 19), Dealer's upcard: [6♦️]

√ Choose your action » Stand
Your hand: [4♥️, 4♣️, 2♠️, 2♠️, 3♠️, 4♣️] (Value: 19), Dealer's cards: [6♦️, 2♣️, 4♣️, Q♦️] (Value: 22)

You win $25!
Your balance: $150

√ Do you want to keep playing? ... yes
√ What is your bet? ... 25
Your hand: [A♦️, 4♠️] (Value: 15), Dealer's upcard: [9♦️]

√ Choose your action » Hit
Your hand: [A♦️, 4♠️, 6♦️] (Value: 21), Dealer's upcard: [9♦️]

You have 21. Automatically stand.
Your hand: [A♦️, 4♠️, 6♦️] (Value: 21), Dealer's cards: [9♦️, K♥️] (Value: 19)

You win $25!
Your balance: $175

√ Do you want to keep playing? ... yes
√ What is your bet? ... 175
Your hand: [6♠️, 6♦️] (Value: 12), Dealer's upcard: [K♦️]

Dealer has blackjack.
Your hand: [6♠️, 6♦️] (Value: 12), Dealer's cards: [K♦️, A♥️] (Value: 21)

Dealer wins.
Your balance: $0

√ Do you want to keep playing? ... yes
√ Would you like to deposit more funds? ... yes
√ How much do you want to deposit? ... 1000
√ What is your bet? ... 50
Your hand: [8♦️, 4♦️] (Value: 12), Dealer's upcard: [J♠️]

√ Choose your action » Hit
Your hand: [8♦️, 4♦️, 7♣️] (Value: 19), Dealer's upcard: [J♠️]

√ Choose your action » Stand
Your hand: [8♦️, 4♦️, 7♣️] (Value: 19), Dealer's cards: [J♠️, 6♥️, 3♦️] (Value: 19)

Push.
Your balance: $1000

√ Do you want to keep playing? ... yes
√ What is your bet? ... 200
Your hand: [7♣️, 10♥️] (Value: 17), Dealer's upcard: [4♣️]

√ Choose your action » Hit
Your hand: [7♣️, 10♥️, 8♦️] (Value: 25), Dealer's upcard: [4♣️]

You busted.
Your hand: [7♣️, 10♥️, 8♦️] (Value: 25), Dealer's cards: [4♣️, J♣️, 10♣️] (Value: 24)

Dealer wins.
Your balance: $800

√ Do you want to keep playing? ... no
Goodbye, thanks for playing!
```

Note - suit icons may render with extra spacing depending on environment run in
