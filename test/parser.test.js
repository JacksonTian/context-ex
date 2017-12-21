'use strict';

const expect = require('expect.js');

const Parser = require('../lib/parser');

function parse(source) {
  // console.log('------ source -------');
  // console.log(source);
  var parser = new Parser(source);
  parser.parse();
  // console.log('------ compiled -------');
  // console.log(parser.code);
  return parser.code;
}

describe('parser', function () {
  it('${@load1} should ok', function () {
    var result =
`(function (context) {
  function toFixed(input) {
    if (typeof input !== 'number') {
      return input;
    }

    if (input % 1 !== 0) {
      return input.toFixed(2);
    }

    return input;
  }
  // 系统负载较高：load1高于1.5，为\${@load1}
  return "系统负载较高：load1高于1.5，为" + toFixed(context.load1);
})
`;
    expect(parse('系统负载较高：load1高于1.5，为${@load1}')).to.be(result);
  });

  it('${@load1 + @load2} should ok', function () {
    var result =
`(function (context) {
  function toFixed(input) {
    if (typeof input !== 'number') {
      return input;
    }

    if (input % 1 !== 0) {
      return input.toFixed(2);
    }

    return input;
  }
  // load maybe too high: \${@load1 + @load2}
  return "load maybe too high: " + toFixed(context.load1 + context.load2);
})
`;
    expect(parse('load maybe too high: ${@load1 + @load2}')).to.be(result);
  });
});
