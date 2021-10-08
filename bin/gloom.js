#!/usr/bin/env node

const Logger = require('../src/Util/Logger');
const Path = require('path');

const args = [...process.argv];
const logger = new Logger();

// exclude base args
while (args.length && (args[0].endsWith('node') || args[0].endsWith('gloom'))) {
  args.shift();
}

if (!args.length) {
  logger.warning('No command givin, execute "help"');
  args.push('help');
}

try {
  const Command = require('../src/Command/' + Path.join(...args[0].split(':')));
  const command = new Command(args);
  try {
    command.doExecute()
      .then(() => {
        command.destroy();
      })
      .catch((error) => {
        command.error(error);
        command.destroy();
      });
  } catch (error) {
    command.error(error);
    command.destroy();
  }
} catch (error) {
  logger.fatal(error);
}