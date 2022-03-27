const { TABLE_HEADERS, PASTE_LIST_KEYS } = require('./constant.js');
const { JSDOM } = require('jsdom');

module.exports = {
  mapToVisibilityString,
  mapToVisiblityCode,
  convertToDate,
  tokenGuard,
  getListTable,
};

function mapToVisibilityString(code) {
  switch (Number(code)) {
    case 0:
      return 'public';
    case 1:
      return 'unlisted';
    case 2:
      return 'private';
    default:
      return 'unknown';
  }
}

function mapToVisiblityCode(string) {
  if (string === 'public') {
    return 0;
  } else if (string === 'unlisted') {
    return 1;
  } else if (string === 'private') {
    return 2;
  }
}

function convertToDate(epoch) {
  const epochNumber = Number(epoch);
  const date = new Date(epochNumber * 1000);

  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  return epochNumber === 0
    ? 'Never'
    : `${day < 10 ? '0' + day : '' + day}.${
        month < 10 ? '0' + month : '' + month
      }.${year} ${hours < 10 ? '0' + hours : '' + hours}:${
        minutes < 10 ? '0' + minutes : '' + minutes
      }`;
}

function tokenGuard(token) {
  return token === '' || token === undefined || token === null;
}

function getListTable(xmlData) {
  const tableData = [];
  tableData.push(TABLE_HEADERS);

  const xmlResponse = new JSDOM(xmlData);

  xmlResponse.window.document.querySelectorAll('paste').forEach((paste) => {
    const pasteKey = paste.querySelector(PASTE_LIST_KEYS.key).textContent;
    const pasteName = paste.querySelector(PASTE_LIST_KEYS.title).textContent;
    const pasteVisibility = paste.querySelector(
      PASTE_LIST_KEYS.visibility
    ).textContent;
    const pasteExpiryDate = paste.querySelector(
      PASTE_LIST_KEYS.expiryDate
    ).textContent;
    const pasteFormat = paste.querySelector(PASTE_LIST_KEYS.format).textContent;

    tableData.push([
      pasteKey,
      pasteName,
      mapToVisibilityString(pasteVisibility),
      convertToDate(pasteExpiryDate),
      pasteFormat,
    ]);
  });

  return tableData;
}
