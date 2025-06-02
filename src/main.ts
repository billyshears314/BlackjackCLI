import App from "./App";

async function main(): Promise<void> {
  const app = await App.setup();
  if (app) await app.run();
}

main();
