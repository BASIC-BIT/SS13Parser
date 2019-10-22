const fs = require('fs');

const FILES = [
  'base',
];

const loadedFiles = FILES.map(fileName => fs.readFileSync(__dirname + `/${fileName}.txt`).toString()).join('\n');

module.exports = [
  loadedFiles,
];
