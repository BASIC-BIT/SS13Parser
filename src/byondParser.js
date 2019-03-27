const m = require('myna-parser');
const createBYONDGrammar = require('./byondGrammar');

function transformASTtoDTO(ast) {
  return {
    rule: ast.rule.name,
    value: ast.input.substring(ast.start, ast.end),
    children: ast.children && ast.children.map(transformASTtoDTO),
  };
}

function parse(data) {
  createBYONDGrammar();

  const rule = m.allRules['BYOND.document'];
  const ast = m.parse(rule, data);


  return transformASTtoDTO(ast);
}

module.exports = parse;