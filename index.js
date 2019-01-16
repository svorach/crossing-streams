const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

const { rnd, cb, stub, transform, forceGc } = require('./util');

const TMP_DIR = path.join(__dirname, 'tmp');
const FILE_NAME = `${rnd()}.html`;
const FILE_PATH = path.join(TMP_DIR, FILE_NAME);
const AMOUNT = parseInt(process.argv[2], 10) || 1000;
const DO_STREAM = process.argv[3] === 'true';

process.env.UV_THREADPOOL_SIZE = 100;

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
  let count = 0;
  let countAccumulator = 0;

  stream.once('drain', cb);

  const collectGarbage = () => {
    if (countAccumulator < 1000) {
      count += 1;
      countAccumulator = count;
    } else {
      countAccumulator = 0;
      cb(`Processed ${count} records, forcing garbage collection.`);
      forceGc();
    }
  };

  const write = async (data, cb) => {
    if (await !stream.write(data)) {
    } else {
      collectGarbage();
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
  const str = `<ul>${arr
    .map(item => {
      return `<li>${transform(item)}</li>`;
    })
    .join('')}</ul>`.trim();

  await fs.writeFile(FILE_PATH, str);
};

const mapWrite = async cb => {
  const arr = stub(AMOUNT);
  const stream = fs.createWriteStream(FILE_PATH);

  if (DO_STREAM) {
    cb('Writing with a stream', chalk.yellow);
    await writeStream(stream, arr, cb);
  } else {
    cb('Writing inline', chalk.yellow);
    await writeInline(arr);
  }

  cb(`Finished writing to file: ${FILE_PATH}`, chalk.blue);
};

(async () => {
  await setup(cb);
  await mapWrite(cb);
  cb('Finished.', chalk.magenta);
  cb(`Wrote ${AMOUNT} HTML list items to ${FILE_PATH}`, chalk.magenta);
})();

// process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
