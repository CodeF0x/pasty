const fs = jest.createMockFromModule('fs');

let fileExists = true;

const rmSync = jest.fn();
const readFileSync = jest.fn(() => '');
const writeFileSync = jest.fn();

function existsSync(path) {
  if (!fileExists) {
    return false;
  }
  return true;
}

function __setFileExists(exists) {
  fileExists = exists;
}

fs.readFileSync = readFileSync;
fs.rmSync = rmSync;
fs.existsSync = existsSync;
fs.writeFileSync = writeFileSync;
fs.__setFileExists = __setFileExists;

module.exports = fs;
