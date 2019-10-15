const fs = require('fs');

const base = fs.readFileSync(__dirname + '/base.txt').toString();

module.exports = [
  base,
];
