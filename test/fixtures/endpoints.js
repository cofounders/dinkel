module.exports = [
  'fruits/:id.json?flavour=sweet',
  'fruits/specials/daily',
  'veggies/:id?weight',
  'nuts/:id',
  {
    'cereals/:id': {
      humanize: function (path, base) {
        return 'Serials';
      }
    },
    'grains': {
      ajax: function () {}
    }
  }
];
