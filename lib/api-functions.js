import inquirer from 'inquirer';
import { tokenGuard } from './functions.js';
import fetch from 'node-fetch';
import { LOGIN_LINK, TABLE_HEADERS } from './constant.js';
import { rmSync, writeFileSync } from 'fs';
import { homedir } from 'os';
import { JSDOM } from 'jsdom';
import { table } from 'table';

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

  const response = await fetch(LOGIN_LINK, {
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

export async function listPastes(argv, apiToken, userToken) {
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

  const amount = argv.amount;

  const response = await fetch('https://pastebin.com/api/api_post.php', {
    body: `api_dev_key=${apiToken}&api_user_key=${userToken}&api_option=list&api_results_limit=${amount}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
  const data = await response.text();

  if (response.status === 200) {
    const tableData = [];
    tableData.push(TABLE_HEADERS);

    const xmlResponse = new JSDOM(data);

    xmlResponse.window.document.querySelectorAll('paste').forEach((paste) => {
      const pasteRow = [];

      pasteRow.push(paste.querySelector('paste_key').textContent);
      pasteRow.push(paste.querySelector('paste_title').textContent);
      pasteRow.push(paste.querySelector('paste_private').textContent);
      pasteRow.push(paste.querySelector('paste_expire_date').textContent);
      pasteRow.push(paste.querySelector('paste_format_short').textContent);

      tableData.push(pasteRow);
    });

    console.log(table(tableData));
  } else {
    console.log('Could not get pastes: ', data);
  }
}

export function logout() {
  try {
    rmSync(`${homedir()}/.pasty.user`);
    console.log('Success! Logged you out.');
  } catch (e) {
    console.log("You're currently not logged in");
  }
}
