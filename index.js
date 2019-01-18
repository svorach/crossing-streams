const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const lorem = require('lorem-ipsum');

const { TMP_DIR, FILE_PATH, AMOUNT, DO_STREAM } = require('./src/constants');
const { createDir, createFile } = require('./src/helpers/fs');
const { rnd, cb, stub, transform, forceGc } = require('./src/helpers/util');

process.env.UV_THREADPOOL_SIZE = 100;

// app
const setup = async cb => {
  await createDir(TMP_DIR, cb);
  await createFile(FILE_PATH, cb);
};

const cleanup = async cb => {
  await fs.unlink(FILE_PATH, cb);

  cb(`Removed ${FILE_PATH}`, chalk.red);
};

const writeStream = async (stream, arr, cb) => {
  const ACCU_LIMIT = 10000;

  let str = '';
  let count = 0;
  let countAccumulator = 0;
  let countGc = 0;

  stream.once('drain', cb);

  const collectGarbage = () => {
    if (countAccumulator < ACCU_LIMIT) {
      count += 1;
      countAccumulator += 1;
    } else {
      countGc += 1;
      cb(`${countAccumulator} iterations, ${countGc} garbage collections, ${count} total.`);
      countAccumulator = 0;
      forceGc(cb);
    }
  };

  const write = (data, cb) => {
    collectGarbage();
    if (countAccumulator < ACCU_LIMIT) {
      str = str + data;
    } else {
      // console.log(str);
      if (!stream.write(str)) {
      } else {
        process.nextTick(cb);
      }
      str = '';
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
      return `<li>${transform(item)}</li><li>${lorem()}</li>`;
    })
    .join('')}</ul>`.trim();

  await fs.writeFile(FILE_PATH, str, cb);
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

  cb(`Finished writing to file: ${FILE_PATH}`, chalk.green);
};

const collectHeapSnapshot = async () => {
  const heapDir = await createDir(path.join(__dirname, 'dump'), cb);
  const heapPath = `${heapDir}/heap-${new Date().toISOString()}`;

  cb(heapPath, chalk.red);

  require('./src/helpers/heap-dump').init(heapDir);

  cb(`Writing heap snapshot to: ${heapPath}`, chalk.green);
};

const run = async () => {
  // await collectHeapSnapshot();

  await setup(cb);
  await mapWrite(cb);

  cb(`Wrote ${AMOUNT} HTML list items to ${FILE_PATH}`, chalk.green);
};

run();

// process.on('exit', cleanup);
process.on('SIGINT', cleanup);
process.on('SIGUSR1', cleanup);
process.on('SIGUSR2', cleanup);
