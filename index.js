var URL = URL ||
  require('urlutils');
var XMLHttpRequest = XMLHttpRequest ||
  require('xmlhttprequest').XMLHttpRequest;
if (typeof Promise === 'undefined') {
  require('es6-shim');
}
var urlbuilder = require('urlbuilder');

var merge = function () {
  return Array.prototype.slice.call(arguments)
    .reduce(function (merged, argument) {
      Object.keys(argument)
        .forEach(function (key) {
          merged[key] = argument[key];
        });
      return merged;
    }, {});
};

var relativeUrl = function (endpoint, base) {
  var baseUrl = new URL(base);
  var endpointUrl = new URL(endpoint, baseUrl.origin + baseUrl.pathname);
  if (baseUrl.search) {
    endpointUrl.search = '?' +
      baseUrl.search.substr(1) + '&' +
      endpointUrl.search.substr(1);
  }
  return endpointUrl;
};

var isString = function (object) {
  return typeof object === 'string';
};

var isObject = function (object) {
  var type = typeof object;
  return object !== null &&
    (type === 'object' || type === 'function') &&
    Array.isArray(object) === false;
};

var Dinkel = function (base, endpoints, options) {
  if (!(this instanceof Dinkel)) {
    return new Dinkel(base, endpoints, options);
  }
  endpoints.reduce(function (memo, endpoint) {
    if (isString(endpoint)) {
      memo.push({
        url: relativeUrl(endpoint, base),
        options: options
      });
    } else if (isObject(endpoint)) {
      Object.keys(endpoint)
        .forEach(function (url) {
          memo.push({
            url: relativeUrl(url, base),
            options: merge(options, endpoint[url])
          });
        });
    }
    return memo;
  }, [])
  .forEach(function (endpoint) {
    var humanize = endpoint.options.humanize || Dinkel.humanize;
    var label = humanize.call(this, endpoint.url, endpoint.options);
    this[label] = new Handler(endpoint.url, endpoint.options);
  }, this);
};

Dinkel.ajax = function (method, url, data) {
  return new Promise(function (resolve, reject) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(Error(xhr.statusText));
        }
      }
    };
    xhr.open(method, url);
    if (this.beforeSend(xhr) !== false) {
      xhr.send(data);
    }
  }.bind(this));
};

Dinkel.slug = /:(\w+)/g;

Dinkel.humanize = function (url, options) {
  return url.pathname
    .split('/')
    // Skip slug patterns
    .filter(function (part) {
      return part.length && !(options.slug || Dinkel.slug).test(part);
    })
    // TitleCase
    .map(function (str) {
      return str.substr(0, 1).toUpperCase() +
        str.substr(1).toLowerCase();
    })
    .join('');
};

var Handler = function (url, options) {
  this.url = url;
  this.ajax = options.ajax || Dinkel.ajax;
  this.beforeSend = options.beforeSend || Function();
};

'CONNECT DELETE GET HEAD OPTIONS POST PUT TRACE TRACK'
  .toLowerCase()
  .split(/\s+/)
  .forEach(function (method) {
    Handler.prototype[method] = function (params, data, response) {
      if (typeof response === 'undefined') {
        response = {};
      }
      var promise = new Promise(function (resolve, reject) {
        var url = urlbuilder(this.url.href, params);
        this.ajax.call(this, method, url, data)
          .then(function (json) {
            Object.keys(json).forEach(function (key) {
              response[key] = json[key];
            });
            resolve(response);
          })
          .catch(reject);
      }.bind(this));
      promise.response = function () {
        return response;
      };
      return promise;
    };
  });

module.exports = Dinkel;
