const parseBYOND = require('../src/byondParser');
const fs = require('fs');
const stringify = require('json-stringify-safe');
const sanitize = require('../src/util/sanitize');
var dir = require('node-dir');

function getParsedData() {
  const data = [];
  dir.readFilesStream(`${__dirname}/data`,
    function(err, stream, next) {
      if (err) throw err;
      var content = '';
      stream.on('data',function(buffer) {
        content += buffer.toString();
      });
      stream.on('end',function() {
        data.push(parseBYOND(content));
        next();
      });
    },
    function(err, files){
      if (err) throw err;
      console.log('finished reading files:', files);
      fs.writeFile(`${__dirname}/output/parsed.json`, JSON.stringify(data), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
}

getParsedData();