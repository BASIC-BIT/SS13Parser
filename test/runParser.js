const parseBYOND = require('../src/byondParser');
const fs = require('fs');
const stringify = require('json-stringify-safe');
const sanitize = require('../src/util/sanitize');
const dir = require('node-dir');
const util = require('util');

const readFilesStreamCallbackWrapper = (targetDir, callback) => { //Make promisify-compliant with an array instead of 2 callback args
  const data = [];
  dir.readFilesStream(targetDir,
    function (err, stream, next) {
      if (err) throw err;
      var content = '';
      stream.on('data', function (buffer) {
        content += buffer.toString();
      });
      stream.on('end', function () {
        data.push(parseBYOND(content));
        next();
      });
    }, (err, files) => callback(err, { files, data }));
};

async function readDir(targetDir) {
  return await util.promisify(readFilesStreamCallbackWrapper)(targetDir);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

async function getParsedData() {
  const { files, data } = await readDir(`${__dirname}/data`);

  console.log('finished reading files:', files);
  const fileData = JSON.stringify(data);
  await util.promisify(fs.writeFile)(`${__dirname}/output/parsed.json`, fileData);
  console.log(`Wrote to output.  Length: ${numberWithCommas(fileData.length)} B`);
}

try {
  getParsedData();
} catch (e) {
  console.log(e);
}