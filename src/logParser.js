const peg = require('pegjs');
const rules = require('./rules/log/index');

module.exports = {
  parse(fileContents) {
    const ruleSet = rules.reduce((set, file) => set.concat(file), '');

    const parser = peg.generate(ruleSet);

    try {
      return parser.parse(fileContents);
    } catch(error) {
      const range = error.location;

      throw { error, message: `Error parsing line ${range.start.line}` };
    }
  }
};

