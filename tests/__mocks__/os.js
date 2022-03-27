const os = jest.createMockFromModule('os');

function homedir() {
  return 'mockHomeDir';
}

os.homedir = homedir;
module.exports = os;
