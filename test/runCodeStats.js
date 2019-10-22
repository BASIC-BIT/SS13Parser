const fs = require('fs');
const util = require('util');
const { getChemRecipes } = require('../src/codeStats');

const gameData = JSON.parse(fs.readFileSync(__dirname + '/output/parsed.json').toString());

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const startTime = Date.now();

  const chemData = getChemRecipes(gameData);

  const fileData = JSON.stringify(chemData);

  await util.promisify(fs.writeFile)(`${__dirname}/output/chemRecipes.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote chem recipes to output.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}