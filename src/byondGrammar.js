"use strict";

const m = require('myna-parser');

function createBYONDGrammar()
{
  let g = new function()
  {
    this.ws = m.char(' \t').oneOrMore;
    this.newLine = m.newLine.oneOrMore;
    this.optionalSpaces = m.char(' \t').zeroOrMore;
    this.any = m.advance;
    this.inline = this.any.unless(m.newLine);
    this.lineEnd = this.newLine.or(m.assert(m.end));
    this.restOfLine = m.seq(this.inline.zeroOrMore).then(this.lineEnd);

    this.end = m.assert(m.end);

    this.emptyLine = m.char(' \t').zeroOrMore.then(this.newLine);

    this.inlineComment = m.seq(this.optionalSpaces, '//', this.restOfLine);
    this.blockComment = m.seq('/*', m.advance.unless('*/').zeroOrMore, '*/', this.newLine.opt).ast;

    this.defineBlock = m.seq('#define', this.restOfLine);
    this.defineLine = this.defineBlock;

    this.refSeparator = m.seq('/');
    this.word = m.choice(m.char('_'), m.choice(m.letters, m.integer)).oneOrMore;

    this.varDelimiter = m.seq(', ');

    const lineEndingCommentsWrapper = (val) =>
      m.seq(val, m.choice(this.inlineComment, this.ws.opt.then(this.lineEnd)));

    this.fullObjectRef = m.seq(this.refSeparator, this.word).oneOrMore.ast;
    this.objectRef = this.word.then(m.seq(this.refSeparator, this.word).zeroOrMore);
    this.functionParams = m.seq('(', this.objectRef.delimited(this.varDelimiter), ')');
    this.fullFunctionDef = m.seq(this.fullObjectRef, this.functionParams).ast;

    this.decimalComponent = m.seq('.',m.integer.oneOrMore);
    this.decimalNumber = m.seq(m.integer.oneOrMore, this.decimalComponent.opt);

    this.key = this.objectRef.ast;
    this.stringValue = this.any.unless(this.newLine.or('"')).zeroOrMore.ast;
    this.stringValueWrapper = m.seq('"', this.stringValue, '"');
    this.numberValue = this.decimalNumber.ast;
    this.otherValue = m.seq(this.inline.zeroOrMore).ast;
    this.value = m.choice(this.stringValueWrapper, this.numberValue, this.otherValue);
    this.keyValuePair = m.seq(this.ws, this.key, ' = ', this.value).ast;

    this.tabbedInLine = m.choice('\t', '    ').oneOrMore.then(this.restOfLine);

    this.functionDefLine = lineEndingCommentsWrapper(this.fullFunctionDef);
    this.objectDefLine = lineEndingCommentsWrapper(this.fullObjectRef);
    this.objectKeyValuePairLine = lineEndingCommentsWrapper(this.keyValuePair);
    this.functionDef = m.seq(this.functionDefLine, this.tabbedInLine.oneOrMore).ast;
    this.objectDef = m.seq(this.objectDefLine, m.choice(this.inlineComment, this.blockComment, this.objectKeyValuePairLine).oneOrMore).ast;

    this.content = m.choice(this.inlineComment, this.defineLine, this.blockComment, this.functionDef, this.objectDef, this.emptyLine);
    this.document = this.content.oneOrMore;
  };

  // Register the grammar, providing a name and the default parse rule
  return m.registerGrammar("BYOND", g, g.document);
}

module.exports = createBYONDGrammar;