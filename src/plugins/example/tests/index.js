var should = require('should');
var sinon = require('sinon');
var testee = require('../');

var deps = {
  cockpit: { on: function() {} },
  rov: { registerPassthrough: function() {} }
};

describe('Example plugin constructor', function() {
  beforeEach(function () {
    sinon.spy(console, 'log');
  });

  afterEach(function () {
    console.log.restore();
  });

  it('the example calls console.log', function () {
    console.log.called.should.be.false;
    new testee('', deps);
    console.log.called.should.be.true;
  });

  it('calls console.foo with right argument', function () {
    new testee('', deps);
    console.log.calledOnce.should.be.true;
    console.log.firstCall.calledWith(sinon.match(/^This/)).should.be.ok;
  });
});