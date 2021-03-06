const { LIST_TABLE_HEADERS, USER_TABLE_HEADERS } = require('../lib/constant');
const {
  convertToDate,
  getListTable,
  mapToVisibilityString,
  mapToVisiblityCode,
  tokenGuard,
  mapAccountPremium,
  mapAccountVisibility,
  getUserData,
} = require('../lib/util');
const { getPasteListXml, getUserXml } = require('./helper/test-helper');

describe('mapToVisibilityString', () => {
  const fixtures = [
    {
      code: 0,
      string: 'public',
    },
    { code: 1, string: 'unlisted' },
    { code: 2, string: 'private' },
    { code: 3, string: 'unknown' },
  ];

  fixtures.forEach((fixture) => {
    it(`should return ${fixture.string} for code ${fixture.code}`, () => {
      expect(mapToVisibilityString(fixture.code)).toBe(fixture.string);
    });
  });
});

describe('mapToVisibilityCode', () => {
  const fixtures = [
    { string: 'public', code: 0 },
    { string: 'unlisted', code: 1 },
    { string: 'private', code: 2 },
  ];

  fixtures.forEach((fixture) => {
    it(`should return ${fixture.code} for ${fixture.code}`, () => {
      expect(mapToVisiblityCode(fixture.string)).toBe(fixture.code);
    });
  });
});

describe('convertToDate', () => {
  // epoch comes back as string from api
  const fixtures = [
    { epoch: '0', dateString: 'Never' },
    { epoch: '1640991600', dateString: '01.01.2022 00:00' },
    { epoch: '1641855600', dateString: '11.01.2022 00:00' },
    { epoch: '1667257200', dateString: '01.11.2022 00:00' },
    { epoch: '1668132900', dateString: '11.11.2022 03:15' },
    { epoch: '1668175500', dateString: '11.11.2022 15:05' },
    // this one has seconds
    { epoch: '1640991615', dateString: '01.01.2022 00:00' },
  ];

  fixtures.forEach((fixture) => {
    it(`should return ${fixture.dateString} for ${fixture.epoch}`, () => {
      expect(convertToDate(fixture.epoch)).toBe(fixture.dateString);
    });
  });
});

describe('tokenGuard', () => {
  const fixtures = [
    {
      tokenInvalid: true,
      token: '',
    },
    { tokenInvalid: true, token: null },
    { tokenInvalid: true, token: undefined },
    { tokenInvalid: false, token: '35sg7a87sgysfsd7' },
  ];

  fixtures.forEach((fixture) => {
    it(`should return ${fixture.tokenInvalid} for token: ${fixture.token}`, () => {
      expect(tokenGuard(fixture.token)).toBe(fixture.tokenInvalid);
    });
  });
});

describe('getListTable', () => {
  it('should return correct table array', () => {
    const pasteKey = '4df6asd';
    const pasteName = 'testi';
    const pasteVisibility = '1';
    const pasteExpiryDate = '0';
    const pasteFormat = 'text';

    const xml = getPasteListXml(
      pasteKey,
      pasteName,
      pasteVisibility,
      pasteExpiryDate,
      pasteFormat
    );

    expect(getListTable(xml)).toEqual([
      [...LIST_TABLE_HEADERS],
      [pasteKey, pasteName, 'unlisted', 'Never', pasteFormat],
    ]);
  });

  it('should return two rows if there are two pastes', () => {
    const pasteKey = '4df6asd';
    const pasteName = 'testi';
    const pasteVisibility = '1';
    const pasteExpiryDate = '0';
    const pasteFormat = 'text';

    const pasteKey2 = '47asdf8';
    const pasteName2 = 'another awesome test that will be green!';
    const pasteVisibility2 = '0';
    const pasteExpiryDate2 = '1640992515';
    const pasteFormat2 = 'javascript';

    const xml = `${getPasteListXml(
      pasteKey,
      pasteName,
      pasteVisibility,
      pasteExpiryDate,
      pasteFormat
    )}
    ${getPasteListXml(
      pasteKey2,
      pasteName2,
      pasteVisibility2,
      pasteExpiryDate2,
      pasteFormat2
    )}`;

    expect(getListTable(xml)).toEqual([
      [...LIST_TABLE_HEADERS],
      [pasteKey, pasteName, 'unlisted', 'Never', pasteFormat],
      [pasteKey2, pasteName2, 'public', '01.01.2022 00:15', pasteFormat2],
    ]);
  });
});

describe('mapAccountPremium', () => {
  it('should return free for 0', () => {
    expect(mapAccountPremium(0)).toBe('free');
  });

  it('should return premium for 1', () => {
    expect(mapAccountPremium(1)).toBe('premium');
  });
});

describe('mapAccountVisibility', () => {
  it('should return public for 0', () => {
    expect(mapAccountVisibility(0)).toBe('public');
  });

  it('should return unlisted for 1', () => {
    expect(mapAccountVisibility(1)).toBe('unlisted');
  });

  it('should return private for 2', () => {
    expect(mapAccountVisibility(2)).toBe('private');
  });

  it('should return error for something else', () => {
    expect(mapAccountVisibility(3)).toBe('error, could not get from api');
  });
});

describe('getUserData', () => {
  it('should return table with mapped data', () => {
    const userName = 'test user';
    const privacy = '0';
    const email = 'test.user@example.com';
    const premium = '1';

    const xml = getUserXml(userName, privacy, email, premium);

    expect(getUserData(xml)).toEqual([
      [...USER_TABLE_HEADERS],
      [userName, 'public', email, 'premium'],
    ]);
  });
});
