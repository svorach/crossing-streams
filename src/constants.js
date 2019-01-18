const path = require('path');

const { rnd } = require('./helpers/util');

const TMP_DIR = path.join(__dirname, 'tmp');
const FILE_NAME = `${rnd()}.html`;
const FILE_PATH = path.join(TMP_DIR, FILE_NAME);
const AMOUNT = parseInt(process.argv[2], 10) || 1000;
const DO_STREAM = process.argv[3] === 'true';

module.exports = {
  TMP_DIR,
  FILE_NAME,
  FILE_PATH,
  AMOUNT,
  DO_STREAM
};
