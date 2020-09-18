#!/usr/bin/env node

const config = require('../lib/command/config');
const { program } = require('commander');
const Server = require('../lib/server');

config.forEach((command) =>
  program.option(command.option, command.description)
);
program.parse(process.argv);

const server = new Server(program.directory);
server.start(program.port, () => {
  console.log(`server start at ${server.port}`);
});
