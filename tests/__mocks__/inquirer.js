const inquirer = {
  prompt: function (args) {
    return Promise.resolve({
      password: 'super secure password',
    });
  },
};

module.exports = inquirer;
