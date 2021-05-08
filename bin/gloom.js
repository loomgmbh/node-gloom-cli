#!/usr/bin/env node

// exclude base args
const Logger = require('../src/Util/Logger');
const args = [...process.argv];

while (args.length && (args[0].endsWith('node') || args[0].endsWith('gloom'))) {
  args.shift();
}

if (!args.length) {
  console.log('No command givin, execute "help"');
  args.push('help');
}

try {
  const Command = require('../src/Command/' + args[0]);
  const command = new Command(args);
  try {
    command.execute();
  } catch (error) {
    command.error(error);
  }
} catch (error) {
  Logger.fatal(error);
}