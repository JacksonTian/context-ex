'use strict';

var expect = require('expect.js');

var Lexer = require('../lib/lexer');
var e_TokenCode = Lexer.e_TokenCode;

var lex = function (source) {
  var lexer = new Lexer(source);
  lexer.getch();

  var tokens = [];
  do {
    lexer.getToken();
    tokens.push(lexer.get_tkstr(lexer.token));
  } while (lexer.token !== e_TokenCode.TK_EOF);

  return tokens;
};

describe('lexer', function () {
  it('"I am ${@name}" should ok', function () {
    expect(lex("I am ${@name}")).to.eql(['I am ', '${', '@name', '}', 'End_Of_File']);
  });

  return;
  it('(@num != 0) should ok', function () {
    expect(lex("@num != 0")).to.eql(['@num', '!=', '0', 'End_Of_File']);
  });

  it('(@num > 10) should ok', function () {
    expect(lex("@num > 10")).to.eql(['@num', '>', '10', 'End_Of_File']);
  });

  it('(@num >= 10) should ok', function () {
    expect(lex("@num >= 10")).to.eql(['@num', '>=', '10', 'End_Of_File']);
  });

  it('(@count < 10) should ok', function () {
    expect(lex("@count < 10")).to.eql(['@count', '<', '10', 'End_Of_File']);
  });

  it('(@count <= 10) should ok', function () {
    expect(lex("@count <= 10")).to.eql(['@count', '<=', '10', 'End_Of_File']);
  });

  it('(@message include "TypeError") should ok', function () {
    expect(lex('@message include "TypeError"')).to.eql([
      '@message', 'include', '"TypeError"', 'End_Of_File']);
  });

  it('(@num > 10 && @num < 20) should ok', function () {
    expect(lex("@num > 10 && @num < 20")).to.eql([
      '@num', '>', '10', '&&', '@num', '<', '20', 'End_Of_File']);
  });

  it('(@num > 10 || @num < 20) should ok', function () {
    expect(lex("@num > 10 || @num < 20")).to.eql([
      '@num', '>', '10', '||', '@num', '<', '20', 'End_Of_File']);
  });

  it('(some => @node == \"v4.1.0\") should ok', function () {
    expect(lex("some => @node == \"v4.1.0\"")).to.eql([
      'some', '=>', '@node', '==', '\"v4.1.0\"', 'End_Of_File']);
  });

  it('(@count <= 10 && (@num == 10 || @num == 20)) should ok', function () {
    expect(lex("@count <= 10 && (@num == 10 || @num == 20)")).to.eql([
      '@count', '<=', '10', '&&', '(', '@num', '==', '10', '||',
      '@num', '==', '20', ')', 'End_Of_File']);
  });
});
