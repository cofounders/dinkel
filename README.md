# Dinkel

A nutritious grain to create friendly, consumable API functions.

Dinkels are also used to create delicious bread.

![wheat-ears-and-wheat-kernels.jpg](wheat-ears-and-wheat-kernels.jpg)

## Installation

    npm install dinkel

## Usage

    var Dinkel = require('dinkel');

### Declarative API listing

```js
// Declare the API service base path and endpoints
var api = new Dinkel('http://api.example.com/', [
  'users',
  'widgets/:id'
]);
```

Methods are generated based on the endpoint routes. For example `api.Users` and `api.Widgets`, in the example above.

### Data Binding

#### Mutation style

```js
// Watch the response data for changes
var data = api.Users.get().json();
// The data object is modified when data is received
Object.observe(data, function (changes) {
  // Do something with the returned JSON
  console.log(changes);
});
```

#### Promise style

```js
// Make API calls and use promises to handle responses
api.Users.get()
  .then(function (data) {
    // Do something with the returned JSON
    console.log(data);
  })
  .catch(function (err) {
    // Handle the error
    console.warn(err);
  });
```

#### Passing a data object

```js
var data = {};
api.Users.get({}, data);
// The data object is modified when data is received
Object.observe(data, function (changes) {
  // Do something with the returned JSON
  console.log(changes);
});
```

### URL Templates & Parameters

See [urlbuilder](https://github.com/cofounders/urlbuilder) for details.

### Options

Coming soon

## Running Tests

    npm test
