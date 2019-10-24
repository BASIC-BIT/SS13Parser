const fs = require('fs');
const util = require('util');
const { parse } = require('../src/manifestParser');

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function smoothData(parsed) {
  return parsed.filter(data => data !== undefined && data !== null);
}

async function getParsedData() {
  const startTime = Date.now();
  const manifestData = fs.readFileSync(__dirname + '/data/codebase/cev_eris.dme').toString();

  const parsedData = parse(manifestData);

  const smoothedData = smoothData(parsedData);

  const fileData = JSON.stringify(smoothedData);

  console.log(`Finished parsing manifest`);

  await util.promisify(fs.writeFile)(`${__dirname}/output/manifest.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote to output.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}