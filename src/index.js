const parseBYOND = require('./byondParser');
const fs = require('fs');
const stringify = require('json-stringify-safe');
const sanitize = require('./util/sanitize');

fs.readFile('./testData/recipes.dm', 'utf-8', (err, data) => {
  const text = data.toString();

  const parsed = parseBYOND(text);

  const stringParsed = stringify(sanitize(parsed, ['rules', 'r']));

  fs.writeFile('./testData/output/recipes.dm', stringParsed, (err) => {
    if(err) {
      console.log(err);
    }
  });
});