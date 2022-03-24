import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import {
  createPaste,
  deletePaste,
  listPastes,
  loginUser,
  logout,
} from './api-functions.js';
import { FORMAT_CHOICES } from './constant.js';

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
      listPastes(argv.amount, apiToken, userToken);
    }
  )
  .command(
    'delete <paste id>',
    'deletes the paste with the specified id',
    (yargs) => {
      return yargs.positional('pasteid', {
        describe: 'the id of the paste you want to delete',
      });
    },
    (argv) => {
      deletePaste(argv.pasteid, apiToken, userToken);
    }
  )
  .command(
    'post',
    'post a paste. either from a file or a string',
    (yargs) => {
      return yargs
        .option('f', {
          alias: 'file',
          describe: 'the path to the file (relative) [REQUIRED OR -s]',
        })
        .option('s', {
          alias: 'string',
          describe: 'the string you want to paste [REQUIRED OR -f]',
        })
        .option('n', {
          alias: 'name',
          describe: 'the name of your paste',
          default: 'Untitled',
        })
        .option('form', {
          alias: 'format',
          describe: 'syntax highlighting of your paste',
          default: 'text',
        })
        .option('v', {
          alias: 'visibility',
          describe: 'whether your paste should be public, private or unlisted',
          default: 'unlisted',
          choices: ['unlisted', 'private', 'public'],
        })
        .option('e', {
          alias: 'expiry',
          describe: 'when your paste should expire',
          default: 'N',
          choices: ['N', '10M', '1H', '1D', '1W', '2W', '1M', '6M', '1Y'],
        })
        .option('fol', {
          alias: 'folder',
          describe: 'the folder of your paste',
        })
        .conflicts('f', 's');
    },
    (argv) => {
      createPaste(argv, apiToken, userToken);
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
