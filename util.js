const chalk = require('chalk');

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

const stub = amount => {
  const arr = [];

  for (let i = 0; i < amount; i++) {
    arr.push('Lorem ipsum dolor sit amet.');
  }

  return arr;
};

const forceGc = () => {
  if (global.gc) {
    global.gc();
  } else {
    cb('No GC hook! Start your program as `node --expose-gc file.js`.');
  }
};

module.exports = { rnd, cb, stub, forceGc, transform };
