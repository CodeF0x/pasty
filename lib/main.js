import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { listPastes, loginUser, logout } from './api-functions.js';

let userToken;
let apiToken;

try {
  apiToken = readFileSync(`${homedir()}/.pasty.api`, 'utf-8').trim();
} catch (e) {
  console.log(
    "It seems like you don't have a ~/.pasty.api file. Please create it and provide your API token."
  );
  process.exit(1);
}
try {
  userToken = readFileSync(`${homedir()}/.pasty.user`, 'utf-8').trim();
} catch (e) {
  // if file does not exist, user is not logged in yet. this is fine
}

yargs(hideBin(process.argv))
  .command(
    'login <username>',
    'logs you in',
    (yargs) => {
      return yargs.positional('username', {
        describe: 'your username',
      });
    },
    (argv) => {
      loginUser(argv, apiToken);
    }
  )
  .command(
    'list [amount]',
    'list your pastes',
    (yargs) => {
      return yargs.positional('amount', {
        default: 20,
        describe: 'the amount of pastes to be displayed',
      });
    },
    (argv) => {
      listPastes(argv, apiToken, userToken);
    }
  )
  .command(
    'logout',
    'logs you out',
    () => {},
    () => {
      logout();
    }
  )
  .demandCommand(1)
  .parse();
