const fs = require('fs');

const FILES = [
  'manifest',
];

const loadedFiles = FILES.map(fileName => fs.readFileSync(__dirname + `/${fileName}.txt`).toString()).join('\n');

module.exports = [
  loadedFiles,
];
