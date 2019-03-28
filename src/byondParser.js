const m = require('myna-parser');
const createBYONDGrammar = require('./byondGrammar');

function transformASTtoDTO(ast) {
  if(!ast) return ast;

  const value = ast.input.substring(ast.start, ast.end);
  return {
    rule: ast.rule.name,
    value: value.length > 100 ? '...' : value,
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