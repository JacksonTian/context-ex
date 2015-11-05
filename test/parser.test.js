'use strict';

var expect = require('expect.js');

var Parser = require('../lib/parser');

var parse = function (source) {
  // console.log('------ source -------');
  // console.log(source);
  var parser = new Parser(source);
  parser.parse();
  // console.log('------ compiled -------');
  // console.log(parser.code);
  return parser.code;
};

describe('parser', function () {
  it('${@load1} should ok', function () {
    var result = '(function (context) {\n  // 系统负载较高：load1高于1.5，为${@load1}\n  return "系统负载较高：load1高于1.5，为" + (context.load1);\n})\n';
    expect(parse("系统负载较高：load1高于1.5，为${@load1}")).to.be(result);
  });

  it('${@load1 + @load2} should ok', function () {
    var result = '(function (context) {\n  // load maybe too high: ${@load1 + @load2}\n  return "load maybe too high: " + (context.load1 + context.load2);\n})\n';
    expect(parse("load maybe too high: ${@load1 + @load2}")).to.be(result);
  });
});
