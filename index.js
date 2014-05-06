var URL = URL ||
  require('urlutils');
var XMLHttpRequest = XMLHttpRequest ||
  require('xmlhttprequest').XMLHttpRequest;
if (typeof Promise === 'undefined') {
  require('es6-shim');
}
var urlbuilder = require('urlbuilder');

var Dinkel = function (base, endpoints, options) {
  var api = {};
  var baseUrl = new URL(base);
  endpoints.forEach(function (endpoint) {
    var endpointUrl = new URL(baseUrl.origin + baseUrl.pathname + endpoint);
    if (baseUrl.search) {
      // Combine query strings
      endpointUrl.search = '?' +
        baseUrl.search.substr(1) +
        '&' +
        endpointUrl.search.substr(1);
    }
    var name = endpointUrl.pathname
      .split('/')
      // Skip :patterns
      .filter(function (part) {
        return part.length && !/:(\w+)/g.test(part);
      })
      // TitleCase
      .map(function (str) {
        return str.substr(0, 1).toUpperCase() +
          str.substr(1).toLowerCase();
      })
      .join('');

    api[name] = new Handler(endpointUrl);
  });
  return api;
}

var Handler = function (url) {
  this.url = url;
};

var ajax = function (method, url) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText);
          }
          catch (err) {
            reject(err);
          }
          resolve(response);
        } else {
          reject(Error(xhr.statusText));
        }
      }
    };
    xhr.open(method, url);
    xhr.send();
  }.bind(this));
};

'get post put delete'
  .split(/\s+/)
  .forEach(function (method) {
    Handler.prototype[method] = function (params, data) {
      if (typeof data === 'undefined') {
        data = {};
      }
      var promise = new Promise(function (resolve, reject) {
        var url = urlbuilder(this.url.href, params);
        ajax.call(this, method, url)
          .then(function (response) {
            Object.keys(response).forEach(function (key) {
              data[key] = response[key];
            });
            resolve(data);
          })
          .catch(reject);
      }.bind(this));
      promise.json = function () {
        return data;
      };
      return promise;
    };
  });

module.exports = Dinkel;
