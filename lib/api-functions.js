import inquirer from 'inquirer';
import fetch from 'node-fetch';
import { API_URLS, FORMAT_CHOICES } from './constant.js';
import { readFileSync, rmSync, writeFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { table } from 'table';
import {
  getListTable,
  mapToVisiblityCode,
  tokenGuard,
  getUserData,
} from './util.js';

export async function loginUser(argv, apiToken) {
  if (tokenGuard(apiToken)) {
    return 'Please provide your pastebin.com API token in the ~/.pasty.api file.';
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

  // text is either the user token or an error from api
  const text = await response.text();

  if (response.status === 200) {
    writeFileSync(`${homedir()}/.pasty.user`, text, 'utf-8');
    return `Success! You're now logged in as ${username}`;
  } else {
    return `Error! ${text}`;
  }
}

export async function listPastes(amount, apiToken, userToken) {
  if (tokenGuard(apiToken)) {
    return 'Please provide your pastebin.com API token in the ~/.pasty.api file.';
  }

  if (tokenGuard(userToken)) {
    return 'Please login first via pasty login <username>';
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

    return table(tableData);
  } else {
    return `Error! ${text}`;
  }
}

export function logout() {
  if (existsSync(`${homedir}/.pasty.user`)) {
    rmSync(`${homedir()}/.pasty.user`);
    return 'Successfully logged you out.';
  }
  return "You're currently not logged in (could not find ~/.pasty.user)";
}

export async function deletePaste(pasteId, apiToken, userToken) {
  if (tokenGuard(apiToken)) {
    return 'Please provide your pastebin.com API token in the ~/.pasty.api file.';
  }

  if (tokenGuard(userToken)) {
    return 'Please login first via pasty login <username>';
  }

  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=delete&api_paste_key=${pasteId}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const text = await response.text();

  return response.status === 200 ? `Success! ${text}` : `Error! ${text}`;
}

export async function createPaste(argv, apiToken, userToken) {
  if (tokenGuard(apiToken)) {
    return 'Please provide your pastebin.com API token in the ~/.pasty.api file.';
  }

  if (tokenGuard(userToken)) {
    return 'Please login first via pasty login <username>';
  }

  const { file, string, format, visibility, expiry, folder, name } = argv;

  if (!file && !string) {
    return 'You need to supply either -f (--file) OR -s (--string)';
  }

  if (!FORMAT_CHOICES.includes(format)) {
    return 'Error! Format option is not supported by pastebin. See https://pastebin.com/doc_api#8 for supported formats';
  }

  if (folder.length > 8) {
    return 'Error! Pastebin only allows up to 8 characters for a folder name.';
  }

  const mappedVisibility = mapToVisiblityCode(visibility);
  const pasteText = file ? readFileSync(file, 'utf-8').trim() : string;

  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=paste&api_paste_code=${pasteText}&api_paste_name=${name}&api_paste_format=${format}&api_paste_private=${mappedVisibility}&api_paste_expire_date=${expiry}&api_folder_key=${folder}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const text = await response.text();

  return response.status === 200 ? `Success! ${text}` : `Error! ${text}`;
}

export async function getUserInfo(apiToken, userToken) {
  if (tokenGuard(apiToken)) {
    return 'Please provide your pastebin.com API token in the ~/.pasty.api file.';
  }

  if (tokenGuard(userToken)) {
    return 'Please login first via pasty login <username>';
  }

  const response = await fetch(API_URLS.apiPost, {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=userdetails`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  const text = await response.text();

  return response.status === 200 ? table(getUserData(text)) : `Error! ${text}`;
}
