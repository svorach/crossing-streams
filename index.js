const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const map = require('map-stream');

// util
const rnd = () => Math.floor(Math.random() * 100000).toString(16);
const cb = (str, color) => {
  if (!str) return;
  const decorator = color ? color : chalk.yellow;
  console.log(decorator(str));
};
const transform = str =>
  `${str
    .split(' ')
    .join('-')
    .replace('.', '')
    .toLowerCase()}-${rnd()}`.trim();

// consts
const TMP_DIR = path.join(__dirname, 'tmp');
const FILE_NAME = `${rnd()}.html`;
const FILE_PATH = path.join(TMP_DIR, FILE_NAME);

const stub = (amount = 1000) => {
  const arr = [];

  for (let i = 0; i < amount; i++) {
    arr.push('Lorem ipsum dolor sit amet.');
  }

  return arr;
};

// fs
const createDir = async cb => {
  if (!fs.existsSync(TMP_DIR)) {
    await fs.mkdir(TMP_DIR);

    cb(`Created ${TMP_DIR}`, chalk.blue);
  }
};

const createFile = async cb => {
  await fs.writeFile(FILE_PATH, '');

  cb(`Created ${FILE_PATH}`, chalk.blue);
};

// app
const setup = async cb => {
  await createDir(cb);
  await createFile(cb);
  cb('Setup complete.');
};

const cleanup = async cb => {
  await fs.unlink(FILE_PATH);

  cb(`Removed ${FILE_PATH}`, chalk.red);
};

const writeStream = async (stream, arr, cb) => {
  stream.once('drain', cb);

  const write = async (data, cb) => {
    if (await !stream.write(data)) {
    } else {
      cb(`Wrote ${data}`);
      process.nextTick(cb);
    }
  };

  write('<ul>', cb);
  arr.map(item => {
    write(`<li>${transform(item)}</li>`, cb);
  });
  write('</ul>', cb);
};

const writeInline = async arr => {
  const str = `<ul>${arr.map(item => `<li>${item}</li>`)}</ul>`;
};

const mapWrite = async cb => {
  const arr = stub(1000000);
  const stream = fs.createWriteStream(FILE_PATH);

  await writeStream(stream, arr, cb);
  // await writeInline(arr);

  cb(`Finished writing to file: ${FILE_PATH}`, chalk.blue);
};

(async () => {
  await setup(cb);
  await mapWrite(cb);
})();

// process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
