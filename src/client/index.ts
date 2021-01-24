import {
  AwaitReactionsOptions,
  Client,
  ClientOptions,
  CollectorOptions,
  Message,
  MessageEmbed,
  MessageEmbedOptions,
  MessageReaction,
  Snowflake,
  User,
} from "discord.js";
import { loadDir } from "../functions";
import {
  Color,
  Command,
  EconomyUtils,
  Event,
  Profile,
  RadLogger,
} from "../types";
import { Collection, BaseClient } from "discord.js";
import { Logger } from "../utils";
import { sep } from "path";
import { profiles } from "../models";
import { connect, Connection, Document } from "mongoose";

class RadClient extends Client {
  constructor(options?: ClientOptions) {
    super(options);
    this.economy = {
      addBal: async function (profileID: string, coinsToAdd: number) {
        return await new Promise(async (resolve, reject) => {
          let newBal: number = 0;
          try {
            const data = await profiles.findByIdAndUpdate(
              profileID,
              { $inc: { balance: coinsToAdd } },
              null
            );
            newBal += (data as any).balance + coinsToAdd;
          } catch (err) {
            reject(err);
          } finally {
            resolve(newBal);
          }
        });
      },
      registerProfile: async function (profileData: {
        _id: string;
        balance?: number;
        inventory?: object[];
      }) {
        return await new profiles(profileData).save();
      },
      removeBal: async function (profileID, coinsToRemove: number) {
        return await new Promise(async (resolve, reject) => {
          let newBal: number = 0;
          try {
            await profiles.findByIdAndUpdate(
              profileID,
              { $inc: { balance: -coinsToRemove } },
              null,
              async (err, data) => {
                if (!data) return reject("No Data");
                if (err) return reject(err);
                newBal = data.get("balance");
              }
            );
          } catch (err) {
            reject(err);
          } finally {
            resolve(newBal);
          }
        });
      },
      deleteProfile: async function (profileID) {
        return await new Promise(async (resolve, reject) => {
          await profiles.findByIdAndDelete(
            profileID,
            null,
            async (err, res) => {
              if (!res) return reject("Unkown profileID");
              if (err) return reject(err);
              resolve();
            }
          );
        });
      },
    };
  }

  public logger: RadLogger = new Logger();
  public developers: Snowflake[] = ["779358708672102470"];
  public economy: EconomyUtils;

  private _commands: Collection<string, Command> = new Collection();
  private _events: Collection<string, Event> = new Collection();
  private _aliases: Collection<string, string> = new Collection();

  public get aliases(): typeof RadClient.prototype._aliases {
    return this._aliases;
  }
  public get commands(): typeof RadClient.prototype._commands {
    return this._commands;
  }
  public get events(): typeof RadClient.prototype._events {
    return this._events;
  }
  public get defualtEmbedColor(): Color {
    return "#00ffe2";
  }

  public async connectToMongo(): Promise<Connection> {
    const connection = (
      await connect(process.env.MONGO_PATH as string, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
    ).connection;
    return connection;
  }

  public async registerEvents(
    eventsDirPath: string = "./src/events"
  ): Promise<void> {
    await loadDir(eventsDirPath, async (err, paths) => {
      if (err) {
        return await this.logger.error(
          `[${err.stack}]: ${err.name} | ${err.message}`
        );
      }
      for (const path of paths) {
        const eventFile: Event =
          (await import(path)).default || (await import(path));
        const fileName = path.split(sep).pop()!.split(".")[0];
        this._events.set(fileName, eventFile);
        try {
          this.on(fileName, eventFile.bind(null, this));
        } catch (err) {
          await this.logger.error(err);
        }
      }
    });
  }
  public async registerCommands(
    commandsDirPath: string = "./src/commands"
  ): Promise<void> {
    await loadDir(commandsDirPath, async (err, paths) => {
      if (err) {
        return await this.logger.error(
          `[${err.stack}]: ${err.name} | ${err.message}`
        );
      }
      for (const path of paths) {
        const commandFile: Command =
          (await import(path)).default || (await import(path));
        const fileName = path.split(sep).pop()!.split(".")[0];
        if (!commandFile.name) {
          commandFile.name = fileName;
        }
        let names: string[] = [commandFile.name || fileName];
        if (commandFile.names) {
          for (const name of commandFile.names) {
            names.push(name);
          }
        }
        if (commandFile.commands) {
          for (const command of commandFile.commands) {
            names.push(command);
          }
        }
        if (commandFile.aliases) {
          for (const alias of commandFile.aliases) {
            names.push(alias);
          }
        }
        for (const name of names) {
          this._aliases.set(name, commandFile.name || fileName);
        }
        commandFile._execute =
          commandFile.run || commandFile.execute || commandFile.callback;
        commandFile._reqPerms =
          commandFile.permissions ||
          commandFile.perms ||
          commandFile.requiredPermissions ||
          commandFile.requiredPerms;
        commandFile._syntax =
          commandFile.usage || commandFile.syntax || commandFile.expectedArgs;
        this._commands.set(commandFile.name, commandFile);
      }
    });
  }
  public async getEmbedColor(
    message: Message,
    isError: boolean = false
  ): Promise<Color> {
    let color: Color =
      message.guild?.me?.displayHexColor !== "#000000"
        ? message.guild?.me?.displayHexColor
        : this.defualtEmbedColor;
    if (isError) color = "#FF0000";
    return color;
  }
  public async sendEmbed(
    data: MessageEmbedOptions,
    message: Message,
    isError: boolean = false
  ): Promise<Message> {
    const embed = await this.createEmbed(data, message, isError);
    const msg = await message.channel.send(embed);
    return msg;
  }
  public async createEmbed(
    data: MessageEmbedOptions,
    message: Message,
    isError: boolean = false
  ): Promise<MessageEmbed> {
    if (!data.author) {
      data.author = {
        name: message.guild?.name || this.user?.username,
        iconURL: message.guild?.iconURL({ dynamic: true, format: "png" }) as
          | string
          | undefined,
      };
    }
    if (!data.color) {
      data.color = await this.getEmbedColor(message, isError);
    }

    if (!data.footer) {
      data.footer = {
        text: message.member?.displayName,
        iconURL: message.author.displayAvatarURL({
          dynamic: true,
          format: "png",
        }),
      };
    }
    if (!data.timestamp) {
      data.timestamp = new Date();
    }
    const embed = new MessageEmbed(data);

    return embed;
  }

  public async getReactions(
    message: Message,
    reactions: string[],
    options?: { user?: User; time?: number }
  ): Promise<Collection<Snowflake, MessageReaction> | null> {
    if (options) {
      if (options.time) {
        if (typeof options.time !== "number" || options.time < 0)
          throw new TypeError("Time must be a non-negative number or zero.");
      }
    }

    const time = options?.time || 30000;
    const user = options?.user || message.author;

    return (
      (await message.awaitReactions(
        (reaction, usr) =>
          usr.id === user.id && reactions.includes(reaction.emoji.name),
        {
          max: 1,
          time: time,
        }
      )) || null
    );
  }
}
export default RadClient;
