var get = Ember.get, set = Ember.set;
var store, Person;

module("DS.FixtureAdapter", {
  setup: function() {
    store = DS.Store.create({
      adapter: 'DS.fixtureAdapter'
    });

    Person = DS.Model.extend({
      firstName: DS.attr('string'),
      lastName: DS.attr('string'),

      height: DS.attr('number')
    });
  },
  teardown: function() {
    Ember.run(function() {
      store.destroy();
    });
    store = null;
    Person = null;
  }
});

test("should load data for a type asynchronously when it is requested", function() {
  Person.FIXTURES = [{
    id: 'wycats',
    firstName: "Yehuda",
    lastName: "Katz",

    height: 65
  },

  {
    id: 'ebryn',
    firstName: "Erik",
    lastName: "Brynjolffsosysdfon",

    height: 70
  }];

  stop();

  var ebryn = store.find(Person, 'ebryn');

  equal(get(ebryn, 'isLoaded'), false, "record from fixtures is returned in the loading state");

  ebryn.addObserver('isLoaded', function() {
    clearTimeout(timer);
    start();

    ok(get(ebryn, 'isLoaded'), "data loads asynchronously");
    equal(get(ebryn, 'height'), 70, "data from fixtures is loaded correctly");

    stop();

    var wycats = store.find(Person, 'wycats');
    wycats.addObserver('isLoaded', function() {
      clearTimeout(timer);
      start();

      equal(get(wycats, 'isLoaded'), true, "subsequent requests for records are returned asynchronously");
      equal(get(wycats, 'height'), 65, "subsequent requested records contain correct information");
    });

    timer = setTimeout(function() {
      start();
      ok(false, "timeout exceeded waiting for fixture data");
    }, 1000);
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should create record asynchronously when it is committed", function() {
  stop();

  var paul = store.createRecord(Person, {firstName: 'Paul', lastName: 'Chavard', height: 70});

  paul.on('didCreate', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isNew'), false, "data loads asynchronously");
    equal(get(paul, 'isDirty'), false, "data loads asynchronously");
    equal(get(paul, 'height'), 70, "data from fixtures is saved correctly");
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should update record asynchronously when it is committed", function() {
  stop();

  var paul = store.findByClientId(Person, store.load(Person, 1, {firstName: 'Paul', lastName: 'Chavard', height: 70}).clientId);

  paul.set('height', 80);

  paul.on('didUpdate', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isDirty'), false, "data loads asynchronously");
    equal(get(paul, 'height'), 80, "data from fixtures is saved correctly");
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should delete record asynchronously when it is committed", function() {
  stop();

  var paul = store.findByClientId(Person, store.load(Person, 1, { firstName: 'Paul', lastName: 'Chavard', height: 70}).clientId);

  paul.deleteRecord();

  paul.on('didDelete', function() {
    clearTimeout(timer);
    start();

    equal(get(paul, 'isDeleted'), true, "data deleted asynchronously");
    equal(get(paul, 'isDirty'), false, "data deleted asynchronously");
  });

  store.commit();

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});

test("should follow isUpdating semantics", function() {
  stop();

  Person.FIXTURES = [{
    id: "twinturbo",
    firstName: "Adam",
    lastName: "Hawkins",
    height: 65
  }];

  var result = store.findAll(Person);

  result.addObserver('isUpdating', function() {
    start();
    equal(get(result, 'isUpdating'), false, "isUpdating is set when it shouldn't be");
  });

  var timer = setTimeout(function() {
    start();
    ok(false, "timeout exceeded waiting for fixture data");
  }, 1000);
});
