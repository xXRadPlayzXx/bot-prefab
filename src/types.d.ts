import { BitFieldResolvable, Message, PermissionString } from 'discord.js';
import { Document } from 'mongoose';
import RadClient from './client';
declare interface RadLogger {
  log(message: string): Promise<string>;
  success(message: string): Promise<string>;
  error(message: string): Promise<string>;
  warn(message: string): Promise<string>;
  info(message: string): Promise<string>;
}
declare type Color = string | number | [number, number, number] | undefined;
declare interface guildConfig extends Document {
  _id: string;
  prefix: string;
  welcomeChannelID?: string;
  memberRoleID?: string;
}
declare interface Profile extends Document {
  _id: string;
  balance: number;
  inventory: object[];
}
declare interface Logger {
  warn(message: string): Promise<string>;
  error(message: string): Promise<string>;
  log(message: string): Promise<string>;
  success(message: string): Promise<string>;
  info(message: string): Promise<string>;
  clear(): Promise<void>;
}
declare interface EconomyUtils {
  addBal(profileID: string, coinsToAdd: number): Promise<number | void>;
  removeBal(profileID: string, coinsToRemove: number): Promise<number | void>;
  deleteProfile(profileID: string): Promise<void>;
  registerProfile(profileData: {
    _id: string;
    balance?: number;
    inventory?: object[];
  }): Promise<Document<any> | void>;
}
declare type permissions = BitFieldResolvable<PermissionString>[];
declare type Event = (
  client: RadClient,
  ...args: any[]
) => Promise<void | any> | void | any;
declare type cmdRunFn = (
  message: Message,
  args: string[],
  client: RadClient,
) => Promise<void | any> | void | any;
declare module 'discord.js' {
  interface Client {
    commands: Collection<string, object>; // change this if u want
  }
}
declare interface Command {
  name?: string;

  description?: string;

  usage?: string;
  syntax?: string;
  expectedArgs?: string;

  names?: string[];
  aliases?: string[];
  commands?: string[];

  perms?: permissions;
  permissions?: permissions;
  requiredPermissions?: permissions;
  requiredPerms?: permissions;

  devOnly?: boolean;
  guildOwnerOnly?: boolean;
  guildOnly?: boolean;

  callback?: cmdRunFn;
  execute?: cmdRunFn;
  run?: cmdRunFn;

  minArgs?: number;
  maxArgs?: number;

  _reqPerms?: permissions;
  _execute?: cmdRunFn;
  _syntax?: string;
}
