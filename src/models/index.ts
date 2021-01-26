import { Schema, model, SchemaTypes, Model } from 'mongoose';
import { guildConfig, Profile } from '../types';

const reqString = {
  type: SchemaTypes.String,
  required: true,
};
const reqNumber = {
  type: SchemaTypes.Number,
  required: true,
  default: 0,
};
const unReqString = {
  type: SchemaTypes.String,
  required: false,
};

const guildConfigSchema: Schema = new Schema({
  _id: reqString, // The server id
  prefix: {
    ...reqString,
    default: process.env.BOT_DEFAULT_PREFIX,
  },
  welcomeChannelID: unReqString,
  memberRoleID: unReqString,
});

const guildConfigs: Model<guildConfig> = model<guildConfig>(
  'guild-configs',
  guildConfigSchema,
);

const profilesSchema: Schema = new Schema({
  _id: reqString,
  balance: reqNumber,
  inventory: {
    type: [Object],
    required: true,
    default: [],
  },
});
const profiles: Model<Profile> = model<Profile>('profiles', profilesSchema);

export { guildConfigs, profiles };
