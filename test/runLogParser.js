const fs = require('fs');
const dir = require('node-dir');
const util = require('util');
const { parse } = require('../src/logParser');

const readFilesStreamCallbackWrapper = (targetDir, callback) => { //Make promisify-compliant with an array instead of 2 callback args
  const data = [];
  const failedFiles = [];
  dir.readFilesStream(targetDir,
    function (err, stream, filename, next) {
      if (err) throw err;
      var content = '';
      stream.on('data', function (buffer) {
        content += buffer.toString();
      });
      stream.on('end', function () {
        try {
          data.push(parse(content));
        } catch(e) {
          console.log(`Failed parsing file ${filename} - ${e.message}\n - ${e.error && e.error.message}`);
          failedFiles.push(filename);
        }
        next();
      });
    }, (err, files) => callback(err, { files, data, failedFiles }));
};

async function readDir(targetDir) {
  return await util.promisify(readFilesStreamCallbackWrapper)(targetDir);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const startTime = Date.now();
  const { files, data, failedFiles } = await readDir(`${__dirname}/data/logs`);

  const fileCount = files.length;
  const failedFileCount = failedFiles.length;
  const successFilesCount = fileCount - failedFileCount;
  const percentSuccess = 100 * successFilesCount / fileCount;

  console.log(`Finished parsing ${files.length} files - failed ${failedFiles.length}`);

  const fileData = JSON.stringify(data);

  await util.promisify(fs.writeFile)(`${__dirname}/output/logs.json`, fileData);
  const endTime = Date.now();

  const secondsToComplete = (endTime - startTime) / 1000;
  console.log(`Wrote to output.\nLength: ${numberWithCommas(fileData.length)} B\nTime: ${secondsToComplete} seconds\nSuccess rate: ${successFilesCount} / ${fileCount} (${percentSuccess}%)`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}