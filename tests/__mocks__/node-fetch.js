const { getXml } = require('./../helper/test-helper');

let fetch;

let statusCode = 200;
let responseText;

function mockFetch(url) {
  return Promise.resolve({
    status: statusCode,
    text: () =>
      responseText
        ? responseText
        : getXml('paste key', 'paste name', '0', '0', 'text'),
  });
}

function __setStatusCode(code) {
  statusCode = code;
}

function __setResponseText(text) {
  responseText = text;
}

fetch = mockFetch;
fetch.__setStatusCode = __setStatusCode;
fetch.__setResponseText = __setResponseText;

module.exports = fetch;
