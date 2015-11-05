'use strict';

var expect = require('expect.js');

var exp = require('../');
var vm = require('vm');

describe('contextex', function () {
  it('should ok', function () {
    var expr = "数量大于等于10，为${@count}";
    var code = exp.parse(expr);
    // get function with vm
    var explain = vm.runInThisContext(code);

    expect(explain({count: 10})).to.be('数量大于等于10，为10');
    expect(explain({count: 5})).to.be('数量大于等于10，为5');
  });

  it('add should ok', function () {
    var expr = "${@count} * 2 = ${@count * 2}";
    var code = exp.parse(expr);
    // get function with vm
    var explain = vm.runInThisContext(code);

    expect(explain({count: 10})).to.be('10 * 2 = 20');
    expect(explain({count: 5})).to.be('5 * 2 = 10');
  });
});
