const fs = require('fs');
const chalk = require('chalk');

const { TMP_DIR, FILE_PATH } = require('../constants');

const createDir = async (dir = TMP_DIR, cb) => {
  if (!fs.existsSync(dir)) {
    await fs.mkdir(dir, cb);

    cb(`Created ${dir}`, chalk.green);
  }

  return dir;
};

const createFile = async (file = FILE_PATH, cb) => {
  await fs.writeFile(FILE_PATH, '', cb);

  cb(`Created ${FILE_PATH}`, chalk.green);

  return file;
};

module.exports = { createDir, createFile };
