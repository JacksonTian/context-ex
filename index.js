'use strict';

const vm = require('vm');

var Parser = require('./lib/parser');

exports.parse = function (source) {
  var parser = new Parser(source);
  parser.parse();
  return parser.code;
};

exports.compile = function (source) {
  var code = exports.parse(source);
  console.log(code);
  return vm.runInThisContext(code);
};
