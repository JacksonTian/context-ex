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
    expect(lex('I am ${@name}')).to.eql(['I am ', '${', '@name', '}', 'End_Of_File']);
  });

  it('"I am ${@name}." should ok', function () {
    expect(lex('I am ${@name}.')).to.eql(['I am ', '${', '@name', '}', '.', 'End_Of_File']);
  });

  it('"I am ${\"JacksonTian\"}" should ok', function () {
    expect(lex('I am ${"JacksonTian"}')).to.eql(['I am ', '${', '"JacksonTian"', '}', 'End_Of_File']);
  });

  it('"${ @load1 }" should ok', function () {
    expect(lex('${ @load1 }')).to.eql(['${', '@load1', '}', 'End_Of_File']);
  });

  it('"$hehe" should ok', function () {
    expect(lex('$hehe')).to.eql(['$hehe', 'End_Of_File']);
  });

  it('"${10}" should ok', function () {
    expect(lex('${10}')).to.eql(['${', '10', '}', 'End_Of_File']);
  });

  it('"${10 + 10}" should ok', function () {
    expect(lex('${10 + 10}')).to.eql(['${', '10', '+', '10', '}', 'End_Of_File']);
  });

  it('"${@var1 + @var2}" should ok', function () {
    expect(lex('${@var1 + @var2}')).to.eql(['${', '@var1', '+', '@var2', '}', 'End_Of_File']);
  });
});
