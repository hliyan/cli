#!/usr/local/bin/node

const cli = require('./index');

const login = async (args) => {
  const username = await cli.prompt('username:');
  const password = await cli.promptPassword('password:');
};

const promptWithDefaults = async (args) => {
  const lang = await cli.prompt('Language: ', {default:'English'});
};

const exit = async () => {
  process.exit(0);
};

const createNote = async (args) => {
  const note = ('note' in args) ? args.note : await cli.prompt('note:');
  const user = ('user' in args) ? args.user : await cli.prompt('user:');
  cli.show(`${user}: ${note}`);
};

cli.setPrompt('bot');
cli.addCommand('exit', exit);
cli.addCommand('login', login);
cli.addCommand('note', createNote);
cli.addCommand('note for <user>', createNote);
cli.addCommand('lang', promptWithDefaults);

cli.run('login');
//cli.run('lang');