var expect = require('chai').expect;
var express = require('express');
var morgan = require('morgan');
var serveStatic = require('serve-static');

var Dinkel = require('../index.js');

var base = 'http://localhost:7357/?sort=name&color';
var endpoints = require('./fixtures/endpoints.js');
var config = {
  onrequest: function (xhr, method, json, promise) {
    xhr.setCustomHeader('Authentication', 'Bearer ' + localStorage.getItem('token'));
  }
};

describe('Dinkel', function () {
  describe('interface', function () {
    it('loads fine', function () {
      expect(Dinkel).to.exist;
    });
    it('has the right signature', function () {
      expect(Dinkel).to.have.length(3);
    });
  });

  describe('invoking', function () {
    it('invokes using `new`', function () {
      var api = new Dinkel(base, endpoints, config);
      expect(api).to.be.ok;
    });
    it('invokes as a function call', function () {
      var api = Dinkel(base, endpoints, config);
      expect(api).to.be.ok;
    });
  });
});

describe('Handler', function () {
  var app;
  var server;
  before(function () {
    app = express()
      // .use(morgan())
      .use(serveStatic('test/fixtures'));
    server = app.listen(7357);
  });
  after(function () {
    server.close();
  });

  var api = new Dinkel(base, endpoints, config);
  it('creates an interface', function () {
    expect(api).to.exist;
  });
  it('has endpoints', function () {
    expect(api).to.have.property('Fruits')
      .that.is.an('object')
      .that.has.a.property('get')
      .that.is.a('function');
  });
  describe('making XHR calls', function (done) {
    var data = {};
    var promise;
    before(function () {
      promise = api.Fruits.get({
        id: 'banana'
      }, data);
    });

    it('returns a promise', function () {
      expect(promise).have.a.property('then')
        .that.is.a('function');
      expect(promise).have.a.property('catch')
        .that.is.a('function');
    });

    it('exposes the JSON data object', function () {
      expect(promise).to.have.a.property('json');
      expect(promise.json()).to.equal(data);
    });

    it('fetches the data', function () {
      promise
        .then(function (response) {
          expect(response).to.equal(data);
          expect(data).to.have.a.property('name');
          done();
        })
        .catch(function (err) {
          done(err || Error('Not sure what went wrong'));
        });
    });
  });
});
