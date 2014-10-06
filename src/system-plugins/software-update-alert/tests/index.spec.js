var should = require('should');
var sinon = require('sinon');
var request = require('supertest');
var express = require('express');
var Testee = require('../');


describe('Example plugin constructor', function() {
  var app = express();
  app.use(express.json());
  var setPreferences = sinon.spy();
  var savePreferences = sinon.spy();

  var deps = {
    app: app,
    config: {
      preferences: { get: function(name) { return undefined; }, set: setPreferences },
      savePreferences: savePreferences
    }
  };
  new Testee('test', deps);

  it('The configuration defaults to showAlerts == true', function (done) { //fix bug 291
    request(app)
      .get('/system-plugin/software-update/config')
      .expect(200)
      .end(function(err,res) {
        if (err) {
          throw err;
        }
        res.body.should.have.property('showAlerts');
        res.body.showAlerts.showAlerts.should.be.true;
        done();
      });
  });
  it('the showAlerts url returns true', function(done) {
    request(app)
      .get('/system-plugin/software-update/config/showAlerts')
      .expect(200)
      .end(function (err, res) {
        if (err) { throw err; }
        res.body.showAlerts.should.be.true;
        done();
      });
  });

  it('the showAlerts url sets the value', function(done) {
    request(app)
      .post('/system-plugin/software-update/config/showAlerts')
      .send({showAlerts: false})
      .expect(200, false, function() {
        deps.config.preferences.set.called.should.be.true;
        deps.config.savePreferences.called.should.be.true;
        var arg = deps.config.preferences.set.lastCall.args[1];
        arg.should.have.property('showAlerts');
        arg.showAlerts.showAlerts.should.be.false;

        done();
      });
  });

});