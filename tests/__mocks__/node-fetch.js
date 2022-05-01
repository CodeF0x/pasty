const { getPasteListXml, getUserXml } = require('./../helper/test-helper');

let fetch;

let statusCode = 200;
let responseText;

function mockFetch(url, options) {
  return Promise.resolve({
    status: statusCode,
    text: () =>
      responseText
        ? responseText
        : options.body.includes('api_option=list')
        ? getPasteListXml('paste key', 'paste name', '0', '0', 'text')
        : getUserXml('test user', '2', 'test.user@example.com', '0'),
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
