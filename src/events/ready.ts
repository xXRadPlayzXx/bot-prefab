import chalk = require('chalk');
import { Event } from '../types';

let readyEvent: Event = async (client) => {
  await client.logger.success(
    `Logged in as ${chalk.redBright.bold(client.user?.tag)}`,
  );
  await client.logger.info(
    `Loaded ${chalk.cyanBright.bold(client.commands.size)} command${
      client.commands.size === 1 ? '' : 's'
    }`,
  );
  await client.logger.info(
    `Loaded ${chalk.cyanBright.bold(client.events.size)} event${
      client.events.size === 1 ? '' : 's'
    }`,
  );
};

export default readyEvent;
