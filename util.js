const rnd = () => Math.floor(Math.random() * 100000).toString(16);

const transform = str =>
  `${str
    .split(' ')
    .join('-')
    .replace('.', '')
    .toLowerCase()}-${rnd()}`.trim();

module.exports = { rnd, transform };
