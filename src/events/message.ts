import { Message } from "discord.js";
import { Model } from "mongoose";
import { capitalize } from "../functions";
import { Command, Event } from "../types";

const guildPrefixes = {}; // { 'guildId' : 'prefix' }
const messageEvent: Event = async (client, message: Message) => {
  const guildPrefix = process.env.BOT_DEFAULT_PREFIX as string;
  const mentionRegex = RegExp(`^<@!?${client.user?.id}>$`);
  const mentionRegexPrefix = RegExp(`^<@!?${client.user?.id}>`);

  let guildName: string = capitalize(message.guild?.name as string);
  if (message.author.bot) return;
  if (message.content.match(mentionRegex)) {
    await client.sendEmbed(
      {
        title: "Prefix",
        description: `My prefix for **${guildName}** is **\`${guildPrefix}\`**.`,
      },
      message,
      false
    );
  }

  const prefix = message.content.toLowerCase().match(mentionRegexPrefix)
    ? (message.content.match(mentionRegexPrefix) as RegExpMatchArray)[0]
    : guildPrefix;

  if (message.author.bot || !message.content.toLowerCase().startsWith(prefix))
    return;

  const args = message.content.slice(prefix.length).trim().split(/ +/g);

  const commandName: string = args.shift()?.toLowerCase() as string;
  if (!commandName) return;
  const cmd =
    client.commands.get(commandName) ||
    client.commands.get(client.aliases.get(commandName) as string);
  if (!cmd) {
    return await client.sendEmbed(
      {
        title: `Unknown Command`,
        description: `I can't find the command \`${commandName}\`.`,
      },
      message,
      true
    );
  }
  if (cmd.guildOwnerOnly && message.member?.id !== message.guild?.owner?.id) {
    return await client.sendEmbed(
      {
        title: `Access Denied`,
        description: `You must be **${guildName}**'s owner in order to use this command.`,
      },
      message,
      true
    );
  }
  if (cmd.devOnly && !client.developers.includes(message.author.id)) {
    return await client.sendEmbed(
      {
        title: `Access Denied`,
        description: `You must be one of the developers in order to use this command.`,
      },
      message,
      true
    );
  }
  if (cmd._reqPerms) {
    for (const perm of cmd._reqPerms) {
      if (
        !message.member?.hasPermission(perm) ||
        !message.member.permissions.has(perm)
      ) {
        return await client.sendEmbed(
          {
            title: `Missing Permissions`,
            description: `In order to use this command you must have the following permission${
              cmd._reqPerms.length === 1 ? "" : "s"
            }: \`${cmd._reqPerms.join(", ")}\``,
          },
          message,
          true
        );
      }
    }
  }
  if (
    (cmd.minArgs && args.length < cmd.minArgs) ||
    (cmd.maxArgs !== undefined && args.length > cmd.maxArgs)
  ) {
    await client.sendEmbed(
      {
        title: `Incorrect Syntax`,
        description: `Please consider using \`${prefix}${cmd.name}${
          cmd._syntax !== undefined ? ` ${cmd._syntax}` : ""
        }\``,
      },
      message,
      true
    );
    return;
  }

  try {
    if (cmd._execute) {
      await cmd._execute(message, args, client);
    }
  } catch (__) {
    const _err: Error = __ as Error;
    const err: string = `${_err.name} | ${_err.message}`;
    await client.sendEmbed(
      {
        title: `Unknown Error`,
        description: `An unknown error occured, please report this to the developers: ***${err}***`,
      },
      message,
      true
    );
    client.logger.error(err);
  } finally {
    client.logger.info(
      `Executed the command "${cmd.name || commandName}" by ${
        message.author.username
      } on ${guildName}`
    );
  }
};

export default messageEvent;
