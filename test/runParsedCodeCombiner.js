const fs = require('fs');
const util = require('util');
const { parse } = require('../src/parsedCodeCombiner');

const gameData = JSON.parse(fs.readFileSync(__dirname + '/output/parsed.json').toString());

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const startTime = Date.now();

  const combinedData = parse(gameData);

  // console.log(combinedData);

  const fileData = JSON.stringify(combinedData);

  await util.promisify(fs.writeFile)(`${__dirname}/output/combinedData.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote combined data to file.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}