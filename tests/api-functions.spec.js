jest.mock('node-fetch');
jest.mock('fs');
jest.mock('os');

const {
  listPastes,
  deletePaste,
  createPaste,
  logout,
  loginUser,
} = require('../lib/api-functions');
const { TABLE_HEADERS } = require('../lib/constant');
const { table } = require('table');
const { __setStatusCode, __setResponseText } = require('node-fetch');
const fs = require('fs');

function testTokenGuard(testApiToken, apiFunction, args, expected) {
  it(`should return error if there is no ${
    testApiToken ? 'api token' : 'user token'
  }`, async () => {
    expect(await apiFunction(...args)).toBe(expected);
  });
}
describe('apiFunctions', () => {
  beforeEach(() => {
    __setResponseText(undefined);
    __setStatusCode(200);
  });

  describe('listPastes', () => {
    testTokenGuard(
      true,
      listPastes,
      [50, undefined, 'user token'],
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );

    testTokenGuard(
      true,
      listPastes,
      [50, 'api token', undefined],
      'Please login first via pasty login <username>'
    );

    it('should return table of pastes', async () => {
      const actualResponse = await listPastes(1, 'paste key', 'paste name');

      // this sucks, but hardcoding the expected table as a string
      // is even worse because of newlines, etc.
      expect(actualResponse).toBe(
        table([
          [...TABLE_HEADERS],
          ['paste key', 'paste name', 'public', 'Never', 'text'], // values set in node-fetch.js mock
        ])
      );
    });

    it('should return error if api returns error', async () => {
      __setStatusCode(500);
      __setResponseText('API Error');

      const actualResponse = await listPastes(1, 'testi', 'testo');

      expect(actualResponse).toBe('Error! API Error');
    });
  });

  describe('deletePaste', () => {
    testTokenGuard(
      true,
      deletePaste,
      ['paste key', undefined, 'user token'],
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );

    testTokenGuard(
      false,
      deletePaste,
      ['paste key', 'api token', undefined],
      'Please login first via pasty login <username>'
    );

    it('should return successfull response if paste was deleted', async () => {
      const expectedResponse = 'Paste removed';

      __setResponseText(expectedResponse);

      const actualResponse = await deletePaste(
        'paste key',
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(`Success! ${expectedResponse}`);
    });

    it('should return error if api returns error', async () => {
      const resonseText = 'Permission denied';

      __setResponseText(resonseText);
      __setStatusCode(403);

      const actualResponse = await deletePaste(
        'pastey key',
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(`Error! ${resonseText}`);
    });
  });

  describe('createPaste', () => {
    testTokenGuard(
      true,
      createPaste,
      [{}, undefined, 'user token'],
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );

    testTokenGuard(
      false,
      createPaste,
      [{}, 'api token', undefined],
      'Please login first via pasty login <username>'
    );

    it('should create paste and return paste url', async () => {
      const expectedResponse = 'https://pastebin.com/12345678';

      __setResponseText(expectedResponse);

      const actualResponse = await createPaste(
        { format: 'text', string: 'string', folder: '' },
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(`Success! ${expectedResponse}`);
    });

    it('should create paste from file', async () => {
      const expectedResponse = 'https://pastebin.com/12345678';

      __setResponseText(expectedResponse);

      const actualResponse = await createPaste(
        {
          format: 'text',
          file: '/some/path/to/file',
          folder: '',
        },
        'api token',
        'user token'
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        '/some/path/to/file',
        'utf-8'
      );
      expect(actualResponse).toBe(`Success! ${expectedResponse}`);
    });

    it('should return error if api returns error', async () => {
      const expectedResponse = 'Ran out of storage';

      __setResponseText(expectedResponse);
      __setStatusCode(500);

      const actualResponse = await createPaste(
        { format: 'text', string: 'string', folder: '' },
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(`Error! ${expectedResponse}`);
    });

    it('should return error if format is not supported by pastebin', async () => {
      const resonseText =
        'Error! Format option is not supported by pastebin. See https://pastebin.com/doc_api#8 for supported formats';

      const actualResponse = await createPaste(
        { format: 'does not exist', string: 'string', folder: '' },
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(resonseText);
    });

    it('should return error if folder name is longer than 8 characters', async () => {
      const expectedResponse =
        'Pastebin only allows up to 8 characters for a folder name.';

      const actualResponse = await createPaste(
        { format: 'text', string: 'string', folder: 'longerthan8characters' },
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(`Error! ${expectedResponse}`);
    });

    it('should return error if neither file or string are supplied', async () => {
      const expectedResponse =
        'You need to supply either -f (--file) OR -s (--string)';

      const actualResponse = await createPaste(
        { format: 'text' },
        'api token',
        'user token'
      );

      expect(actualResponse).toBe(expectedResponse);
    });
  });

  describe('logOut', () => {
    it('should delete the ~/.pasty.user file', () => {
      const expectedResponse = 'Successfully logged you out.';

      const actualResponse = logout();

      expect(actualResponse).toBe(expectedResponse);
      expect(fs.rmSync).toHaveBeenCalledWith('mockHomeDir/.pasty.user');
    });

    it('should return error if there is no ~/.pasty.user file', () => {
      const expectedResponse =
        "You're currently not logged in (could not find ~/.pasty.user)";

      fs.__setFileExists(false);
      const actualResponse = logout();

      expect(actualResponse).toBe(expectedResponse);
      expect(fs.rmSync).not.toHaveBeenCalled();
    });
  });

  describe('loginUser', () => {
    testTokenGuard(
      true,
      loginUser,
      [{}, undefined],
      'Please provide your pastebin.com API token in the ~/.pasty.api file.'
    );

    it('should write user token to file if login was successfull', async () => {
      const username = 'dummyUser';
      const tokenFromApi = 'token from api';
      const expectedResponse = `You're now logged in as ${username}`;

      __setResponseText(tokenFromApi);

      const actualResponse = await loginUser({ username }, 'api token');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'mockHomeDir/.pasty.user',
        tokenFromApi,
        'utf-8'
      );
      expect(actualResponse).toBe(`Success! ${expectedResponse}`);
    });

    it('should return error if api returns error', async () => {
      const expectedResponse = 'Login service unavailable';

      __setResponseText(expectedResponse);
      __setStatusCode(500);

      const actualResponse = await loginUser({}, 'api token');

      expect(actualResponse).toBe(`Error! ${expectedResponse}`);
    });
  });
});
