var expect = require('chai').expect;
var express = require('express');
var morgan = require('morgan');
var serveStatic = require('serve-static');

var Dinkel = require('../index.js');

var base = 'http://localhost:7357/?sort=name&color';
var endpoints = require('./fixtures/endpoints.js');
var config = {};

describe('Dinkel', function () {
  describe('has an interface', function () {
    it('that loads fine', function () {
      expect(Dinkel).to.exist;
    });

    it('that has the right function signature', function () {
      expect(Dinkel).to.have.length(3);
    });
  });

  describe('can be invoked', function () {
    it('as a constructor with "new"', function () {
      var api = new Dinkel(base, endpoints, config);
      expect(api).to.be.ok;
    });

    it('as a function call', function () {
      var api = Dinkel(base, endpoints, config);
      expect(api).to.be.ok;
    });
  });
});

describe('Handler', function () {
  var app;
  var server;

  var trackAjaxHandler = false;
  var trackBeforeSend = false;

  var api = new Dinkel(base, endpoints, {
    ajax: function (xhr, method, json, promise) {
      trackAjaxHandler = true;
      return Dinkel.ajax.apply(this, arguments);
    },
    beforeSend: function (xhr) {
      trackBeforeSend = true;
    }
  });

  before(function () {
    app = express()
      .use(morgan())
      .use(serveStatic('test/fixtures'));
    server = app.listen(7357);
  });

  after(function () {
    server.close();
  });

  it('creates an interface', function () {
    expect(api).to.exist;
  });

  it('has endpoints', function () {
    expect(api).to.have.property('Fruits')
      .that.is.an('object');
    expect(api).to.have.property('FruitsSpecialsDaily')
      .that.is.an('object');
    expect(api).to.have.property('Veggies')
      .that.is.an('object');
    expect(api).to.have.property('Nuts')
      .that.is.an('object');
  });

  it('has HTTP methods', function () {
    expect(api).to.have.deep.property('Fruits.get')
      .that.is.a('function');
    expect(api).to.have.deep.property('Nuts.post')
      .that.is.a('function');
    expect(api).to.have.deep.property('Nuts.put')
      .that.is.a('function');
    expect(api).to.have.deep.property('Nuts.delete')
      .that.is.a('function');
  });

  it('uses custom endpoint options', function () {
    expect(api).to.have.a.property('Serials');
  });

  describe('makes XHR calls', function (done) {
    var data = {};
    var response = {};
    var promise;

    before(function () {
      promise = api.Fruits.get({
        id: 'banana'
      }, data, response);
    });

    it('returns a promise', function () {
      expect(promise).have.a.property('then')
        .that.is.a('function');
      expect(promise).have.a.property('catch')
        .that.is.a('function');
    });

    it('exposes the JSON response object', function () {
      expect(promise).to.have.a.property('response');
      expect(promise.response()).to.equal(response);
    });

    it('fetches the response', function () {
      promise
        .then(function (json) {
          expect(json).to.equal(response);
          expect(json).to.have.a.property('name')
            .that.equals('banana');
          done();
        })
        .catch(function (err) {
          done(err || Error('Not sure what went wrong'));
        });
    });

    it('invokes a "beforeSend" callback', function () {
      expect(trackBeforeSend).to.be.true;
    });

    it('invokes a custom "ajax" provider', function () {
      expect(trackAjaxHandler).to.be.true;
    });
  });
});
