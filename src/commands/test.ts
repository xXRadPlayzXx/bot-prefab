import { Command } from "../types";

const TestCommand: Command = {
  maxArgs: 0,
  callback: async (message, args, client) => {
    await client.economy.removeBal(message.author.id, 2).catch(async(err) => {
      return await message.reply("No profile found")
    }).then((newCoins) => {
      console.log(newCoins)
    })
  },
};

export default TestCommand;
