import { Intents } from "discord.js";
import { config as loadEnv } from "dotenv";

import Client from "./client";

loadEnv();

const client: Client = new Client({ ws: { intents: Intents.ALL } });
const token: string = process.env.BOT_TOKEN as string;

(async () => {
  await client.login(token);
  await client.connectToMongo();
  await client.registerCommands();
  await client.registerEvents();
})();
