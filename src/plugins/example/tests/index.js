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
    sinon.spy(deps.cockpit, 'on');
    sinon.spy(deps.rov, 'registerPassthrough');
  });

  afterEach(function () {
    console.log.restore();
    deps.cockpit.on.restore();
    deps.rov.registerPassthrough.restore();
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

  it('registers on events from cockpit', function() {
    new testee('', deps);
    deps.cockpit.on.calledOnce.should.be.true;
  });

  it('registers passthrough commands', function() {
    new testee('', deps);
    deps.rov.registerPassthrough.calledOnce.should.be.true;
  });
});