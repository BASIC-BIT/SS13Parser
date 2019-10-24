const fs = require('fs');
const dir = require('node-dir');
const util = require('util');
const { parse } = require('../src/codeParser');

const parseFiles = async (targetDir, paths) => { //Make promisify-compliant with an array instead of 2 callback args
  const data = [];
  const failedFiles = [];
  const readFiles = [];

  await Promise.all(paths.map(async (path) => {
    try {
      const content = await util.promisify(fs.readFile)(targetDir + path);
      data.push(parse(content.toString()));
      readFiles.push(path);
    } catch (e) {
      console.log(`Failed parsing file ${path} - ${e.message}\n - ${e.error && e.error.message}`);
      failedFiles.push(path);
    }
  }));

  return { data, failedFiles, readFiles };
};

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const dir = `${__dirname}/data/codebase/`;
  const manifestPath = `${__dirname}/output/manifest.json`;
  const startTime = Date.now();

  const paths = JSON.parse(fs.readFileSync(manifestPath).toString());

  const { readFiles, data, failedFiles } = await parseFiles(dir, paths);

  const fileCount = readFiles.length;
  const failedFileCount = failedFiles.length;
  const successFilesCount = fileCount - failedFileCount;
  const percentSuccess = 100 * successFilesCount / fileCount;

  console.log(`Finished parsing ${fileCount} files - failed ${failedFiles.length}`);

  const mappedData = data.reduce((acc, cur) => ({ ...acc, ...cur }), {});

  const fileData = JSON.stringify(mappedData);

  await util.promisify(fs.writeFile)(`${__dirname}/output/test.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote to output.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds\nSuccess rate: ${successFilesCount} / ${fileCount} (${percentSuccess}%)`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}