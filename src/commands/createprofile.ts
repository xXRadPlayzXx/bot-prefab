import { Command } from "../types";

const createProfileCmd: Command = {
  callback: async(message, args, bot) => {
      await bot.economy.registerProfile({
          _id: message.author.id,
          balance: 0,
          inventory: [],
          
      })
  },
};

export default createProfileCmd;
