import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { API_URLS, FORMAT_CHOICES } from './constant.js';
import { readFileSync, rmSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { table } from 'table';
import { getListTable, mapToVisiblityCode, tokenGuard } from './util.js';

export async function loginUser(argv, apiToken) {
  if (tokenGuard(apiToken)) {
    console.log(
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );
    process.exit(1);
  }

  const username = argv.username;
  const password = (
    await inquirer.prompt([
      {
        type: 'password',
        message: 'enter your password:',
        name: 'password',
        mask: '*',
      },
    ])
  ).password;

  const response = await fetch(API_URLS.login, {
    body: `api_dev_key=${apiToken}&api_user_name=${username}&api_user_password=${password}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (response.status === 200) {
    const userToken = await response.text();
    writeFileSync(`${homedir()}/.pasty.user`, userToken, 'utf-8');
    console.log(`Success! You're now logged in as ${username}`);
  } else {
    console.log(await response.text());
    process.exit(1);
  }
}

export async function listPastes(amount, apiToken, userToken) {
  if (tokenGuard(apiToken)) {
    console.log(
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );
    process.exit(1);
  }

  if (tokenGuard(userToken)) {
    console.log('Please login first via pasty login <username>');
    process.exit(1);
  }

  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=list&api_results_limit=${amount}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const text = await response.text();

  if (response.status === 200) {
    const tableData = getListTable(text);

    console.log(table(tableData));
  } else {
    console.log(`Error! ${text}`);
  }
}

export function logout() {
  try {
    rmSync(`${homedir()}/.pasty.user`);
    console.log('Successfully logged you out.');
  } catch (e) {
    console.log("You're currently not logged in");
  }
}

export async function deletePaste(pasteId, apiToken, userToken) {
  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=delete&api_paste_key=${pasteId}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const text = await response.text();

  if (response.status === 200) {
    console.log(`Success! ${text}`);
  } else {
    console.log(`Error! ${text}`);
  }
}

export async function createPaste(argv, apiToken, userToken) {
  const { file, string, format, visibility, expiry, folder, name } = argv;

  if (format && !FORMAT_CHOICES.includes(format)) {
    console.log(
      'Error! Format option is not supported by pastebin. See https://pastebin.com/doc_api#8 for supported formats'
    );
    process.exit(1);
  }

  const mappedVisibility = mapToVisiblityCode(visibility);
  const pasteText = file ? readFileSync(file, 'utf-8').trim() : string;

  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=paste&api_paste_code=${pasteText}&api_paste_name=${name}&api_paste_format=${format}&api_paste_private=${mappedVisibility}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const text = await response.text();

  if (response.status === 200) {
    console.log(text);
  } else {
    console.log(`Error! ${text}`);
  }
}
