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
      const apiRes = await listPastes(1, 'paste key', 'paste name');

      // this sucks, but hardcoding the expected table as a string
      // is even worse because of newlines, etc.
      expect(apiRes).toBe(
        table([
          [...TABLE_HEADERS],
          ['paste key', 'paste name', 'public', 'Never', 'text'], // values set in node-fetch.js mock
        ])
      );
    });

    it('should return error if api returns error', async () => {
      __setStatusCode(500);
      __setResponseText('API Error');

      const apiRes = await listPastes(1, 'testi', 'testo');

      expect(apiRes).toBe('Error! API Error');
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
      const responseText = 'Paste removed';

      __setResponseText(responseText);

      const apiRes = await deletePaste('paste key', 'api token', 'user token');

      expect(apiRes).toBe(`Success! ${responseText}`);
    });

    it('should return error if api returns error', async () => {
      const resonseText = 'Permission denied';

      __setResponseText(resonseText);
      __setStatusCode(403);

      const apiRes = await deletePaste('pastey key', 'api token', 'user token');

      expect(apiRes).toBe(`Error! ${resonseText}`);
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
      const responseText = 'https://pastebin.com/12345678';

      __setResponseText(responseText);

      const apiRes = await createPaste(
        { format: 'text' },
        'api token',
        'user token'
      );

      expect(apiRes).toBe(`Success! ${responseText}`);
    });

    it('should create paste from file', async () => {
      const responseText = 'https://pastebin.com/12345678';

      __setResponseText(responseText);

      const apiRes = await createPaste(
        {
          format: 'text',
          file: '/some/path/to/file',
        },
        'api token',
        'user token'
      );

      expect(fs.readFileSync).toHaveBeenCalledWith(
        '/some/path/to/file',
        'utf-8'
      );
      expect(apiRes).toBe(`Success! ${responseText}`);
    });

    it('should return error if api returns error', async () => {
      const responseText = 'Ran out of storage';

      __setResponseText(responseText);
      __setStatusCode(500);

      const apiRes = await createPaste(
        { format: 'text' },
        'api token',
        'user token'
      );

      expect(apiRes).toBe(`Error! ${responseText}`);
    });

    it('should return error if fomit is not supported by pastebin', async () => {
      const apiRes = await createPaste(
        { format: 'does not exist' },
        'api token',
        'user token'
      );

      expect(apiRes).toBe(
        'Error! Format option is not supported by pastebin. See https://pastebin.com/doc_api#8 for supported formats'
      );
    });
  });

  describe('logOut', () => {
    it('should delete the ~/.pasty.user file', () => {
      const responseText = 'Successfully logged you out.';

      const apiRes = logout();

      expect(apiRes).toBe(responseText);
      expect(fs.rmSync).toHaveBeenCalledWith('mockHomeDir/.pasty.user');
    });

    it('should return error if there is no ~/.pasty.user file', () => {
      const responseText =
        "You're currently not logged in (could not find ~/.pasty.user)";

      fs.__setFileExists(false);
      const apiRes = logout();

      expect(apiRes).toBe(responseText);
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
      const responseText = `You're now logged in as ${username}`;

      __setResponseText(tokenFromApi);

      const apiRes = await loginUser({ username }, 'api token');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        'mockHomeDir/.pasty.user',
        tokenFromApi,
        'utf-8'
      );
      expect(apiRes).toBe(`Success! ${responseText}`);
    });

    it('should return error if api returns error', async () => {
      const responseText = 'Login service unavailable';

      __setResponseText(responseText);
      __setStatusCode(500);

      const apiRes = await loginUser({}, 'api token');

      expect(apiRes).toBe(`Error! ${responseText}`);
    });
  });
});
