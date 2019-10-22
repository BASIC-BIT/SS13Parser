const fs = require('fs');
const util = require('util');
const { getLoginTimeData } = require('../src/logStats');

const gameData = JSON.parse(fs.readFileSync(__dirname + '/output/logs.json').toString());

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const startTime = Date.now();

  const loginData = getLoginTimeData(gameData[0]);

  const fileData = JSON.stringify(loginData);

  await util.promisify(fs.writeFile)(`${__dirname}/output/loginData.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote login data to output.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}