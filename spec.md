var api = new API(
  'http://api.example.com/' + v, [
    'nugit/:clientid/:nugitid',
    'crud'
  ]
);

api.nugit.post()
api.nugit.clientid(123).nugitid(456).get()
api.crud.post()

......


var api = new API(
  'http://sebastiaandeckers.apiary-mock.com', [
    'notes/:id'
  ]
);

api.notes.get()
api.notes.get({id: 123})

.......


var api = new API(
  'http://api.example.com/?page&per_page', [
    'fruits/:id?sort=name&category=all&color',
    'crud',
    'notebook/:notebookid/notes/:notesid/messages/:messagesid'
  ], {
    onrequest: function (xhr, method, json, promise) {
      xhr.setCustomHeader('Authentication', 'Bearer ' + localStorage.getItem('token'));
    }
  }
);

var promise = api.fruits.id(123).get()

api.reposByOrg
api.nugitsByClient
api.messagesByNoteByNotebook

var promise = api.fruits.sort('price').color('yellow').direction('asc').get()
var promise = api.fruits.get({sort: 'price', direction: 'asc', color: 'yellow'})
var promise = api.fruits.id(456).get()
var promise = api.fruits.get({id: 456})

var promise = api.fruits.post({name: 'bananas', count: 5, bar: 40})

var promise = api.fruits.id(456).update({name: 'bananas', count: 5})

var promise = api.fruitsById.get({id: 123, sort: 'name', direction: 'asc'})
  .then(function (data) {...})
  .catch(function (err) {...});

var view = new View({
  data: promise.json()
});

var View = function (options) {
  this.options = options;
  Object.observe(this.options.data, function () {
    this.render();
  }.bind(this));
};

View.prototype.render = function () {
  Handelbars(this.options.data);
};


.........



var api = new API('https://api.nugit.co/v201401/', [
  'session',
  'session/info',
  'clients/:id.json',
  'clients/:clientid/nugits',
]);

api.clients.get({
  id: 123
})
api.clients.get({
  clientid: 456
})
