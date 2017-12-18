'use strict';

const vm = require('vm');

const Parser = require('./lib/parser');

exports.parse = function (source) {
  var parser = new Parser(source);
  parser.parse();
  return parser.code;
};

exports.compile = function (source) {
  var code = exports.parse(source);
  return vm.runInThisContext(code);
};

exports.render = function (source, context) {
  return exports.compile(source)(context);
};
