const fs = require('fs');

const FILES = [
  'base',
  'comment',
  'define',
  'list',
  'math',
  'misc',
  'object',
  'primitive',
  'proc',
  'string',
  'whitespace',
];

const loadedFiles = FILES.map(fileName => fs.readFileSync(__dirname + `/${fileName}.txt`).toString()).join('\n');

module.exports = [
  loadedFiles,
];
