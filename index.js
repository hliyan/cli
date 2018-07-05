var inquirer = require('inquirer');

// cli metadata
const meta = {
  prompt: { type: 'input', name: 'value' },
  promptPassword: { type: 'password', name: 'value' },
  confirm: { type: 'confirm', name: 'value' },
  prefix: '>'
};

// session state
const state = {

};

// map of command objects, by pattern string
const commands = {};

// sets the commandline prompt text to a new value
// e.g. setPrompt('$');
const setPrompt = (prompt) => {
  meta.prefix = prompt;
};

// set state
const setState = (args) => {
  Object.assign(state, args);
};

const getState = (key) => {
  return state[key]; // WARNING: mutable
};

// reusable prompt; wraps inquirer
// e.g. const name = await prompt('What is your name?');
const prompt = async (message, options={}) => {
  const answer = await inquirer.prompt([{ ...{...meta.prompt,...options}, prefix: meta.prefix, message }]);
  return answer.value;
};

// reusable password prompt; wraps inquirer
const promptPassword = async (message) => {
  const answer = await inquirer.prompt([{ ...meta.promptPassword, prefix: meta.prefix, message }]);
  return answer.value;
};

// reusable confirmation prompt. wraps inquirer.
// e.g. const proceed = await confirm('You want to proceed?');
// e.g. const proceed = await confirm('You want to proceed?', {default: false});
// returns boolean
const confirm = async (message, options) => {
  const answer = await inquirer.prompt([{ ...{...meta.confirm, ...options}, prefix: meta.prefix, message }]);
  return answer.value;
};

// e.g. cli.addCommand(({url}) => {}, 'open <url>')
const addCommand = (pattern, action) => {
  const tokens = [];
  pattern.split(' ').forEach((token) => {
    tokens.push({
      value: token.replace(/<|>/g, ''),
      isArg: token.includes('<')
    });
  });
  commands[pattern] = {pattern, tokens, action};
};

// matches a set of input tokens against a set of command tokens
// returns an object { args: {amount: 100, currency: 'yen'}}
// returns null if no match
const matchTokens = (inputTokens, commandTokens) => {
  if (inputTokens.length !== commandTokens.length) {
    return null;
  }

  const intent = {args: {}};
  for (let i = 0; i < commandTokens.length; i++) { // for each token in command
    if (commandTokens[i].isArg) {
      intent.args[commandTokens[i].value] = inputTokens[i]; // gather args
    } else if (inputTokens[i] !== commandTokens[i].value) { // compare non-args
      return null;
    }
  }
  return intent;
};

const getIntent = (input) => {
  // convert 'hello "John Doe"' ==> ['hello', 'John, Doe'], if not already tokenized
  const inputTokens = (input instanceof Array) ? input : input.match(/"([^"]+)"|\S+/g);
  for (let i = 0; i < inputTokens.length; i++) {
    inputTokens[i] = inputTokens[i].replace(/"/g, '');
  }
  
  for (let pattern in commands) {
    const command = commands[pattern];
    const intent = matchTokens(inputTokens, command.tokens);
    if (intent) {
      intent.action = command.action;
      return intent;
    }
  }
  return null;
};

const show = (text) => {
  console.log(`${text}`);
};

const run = async (args) => {
  // command mode
  if (args) {
    const intent = getIntent(args);
    if (intent) {
      const output = await intent.action(intent.args);
      exit();
    }
  }

  // repl mode
  while (true) {
    const input = await prompt('>');
    if (input === '') {
      continue;
    }

    const intent = getIntent(input);
    if (intent === null) {
      show('What?');
      continue;
    }

    const output = await intent.action(intent.args);
  }
};

const exit = () => {
  process.exit(0);
};

const help = async (args) => {
  for (let command in commands) {
    show(command);
  }
};

addCommand('exit', exit);
addCommand('help', help);

module.exports = {
  prompt,
  promptPassword,
  confirm,
  setPrompt,
  show,
  addCommand,
  run,
  setState,
  getState,
  exit
};