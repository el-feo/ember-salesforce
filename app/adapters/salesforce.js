import Ember from 'ember';
import DS from 'ember-data';
/* global jsforce  */

var SalesforceAdapter = DS.Adapter.extend(Ember.Evented, {
  defaultSerializer: 'salesforce',
  coalesceFindRequests: false,
  connection: null,

  pathForType: function(type) {
    return Ember.String.capitalize(type.typeKey);
  },

  /**
    This is the main entry point into finding records. The first parameter to
    this method is the model's name as a string.

    @method find
    @param {DS.Model} type
    @param {Object|String|Integer|null} id
   */
  find: function(store, type, id, record) {
    var self = this;
    console.log("find: ", type, id);

    this.conn();

    return new Ember.RSVP.Promise(function(resolve, reject) {

      // Single record retrieval
      return self.connection.sobject(self.pathForType(type)).retrieve(id, function(err, data) {
        if (err) {
          return console.error(err);
        }
        console.log("Id : " + data.Id);
        console.log("Name : " + data.Name);
        // ...
        console.log(data);
        Ember.run(null, resolve, data);
      });

    });
  },

  findAll: function (store, type) {
    var self = this;

    this.conn();

    var fields = ['Id'];
    type.eachAttribute(function(name, meta) {
      fields.push(name);
    });

    return new Ember.RSVP.Promise(function(resolve, reject) {

      var records = [];
      return self.connection.query("SELECT " + fields.join(', ') + " FROM " + self.pathForType(type), function(err, result) {
        if (err) { return console.error(err); }

        console.log("total : " + result.totalSize);
        console.log("fetched : " + result.records.length);
        console.log("done ? : " + result.done);
        if (!result.done) {
          // you can use the locator to fetch next records set.
          // Connection#queryMore()
          console.log("next records URL : " + result.nextRecordsUrl);
        }

        for (var i = 0; i < result.records.length; i++) {
          console.log(result.records[i]);
          records.push(Ember.copy(result.records[i]));
        }
        resolve(records);
      });
    });
  },

  createRecord: function (store, type, record) {
    var data = {};
    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    console.log("Create : ", type, " with ", data);
    var self = this;
    this.conn();
    return new Ember.RSVP.Promise(function(resolve, reject) {
      // Single record creation
      self.connection.sobject(self.pathForType(type)).create(data, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log("Created record id : " + ret.id);
        // ...
        if (ret.success === true) {
          console.log('resolve', ret);
          resolve(ret);
        }
      });
    });
  },

  updateRecord: function (store, type, record) {
    var data = {};

    var serializer = store.serializerFor(type.typeKey);

    serializer.serializeIntoHash(data, type, record, { includeId: true });

    var self = this;
    this.conn();
    return new Ember.RSVP.Promise(function(resolve, reject) {

      // Single record update
      self.connection.sobject(self.pathForType(type)).update(data, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log('Updated Successfully : ' + ret.id);
        if (ret.success === true && ret.errors.length === 0) {
          resolve(ret);
        }
        // ...
        console.log(ret);
      });

    });
  },

  deleteRecord: function (store, type, record) {
    var id = Ember.get(record, 'id');

    console.log('Delete ' + type + ' ' + id);
    var self = this;
    this.conn();
    return new Ember.RSVP.Promise(function(resolve, reject) {
      // Single record deletion
      return self.connection.sobject(self.pathForType(type)).destroy(id, function(err, ret) {
        if (err || !ret.success) { return console.error(err, ret); }
        console.log('Deleted Successfully : ' + ret.id);
        console.log(ret);
      });
    });
  },

  conn: function() {
    if (this.connection === null) {
      this.connection = new jsforce.Connection({
        serverUrl : 'https://na15.salesforce.com',
        sessionId : '00Di0000000Hh8R!ARoAQDz6UWFI79EEVyPtNnfI1yOfENj.0RBaj2BFp._FEow9ZiUi5NJW4y3faIe3TsN0M6SK.2G9GJ54EsYp6mMjlk3eUHu5',
        proxyUrl: 'https://frozen-citadel-5038.herokuapp.com/proxy/'
      });
      // console.log("logging in...");
      // this.connection.login('joe@gettinderbox.com', 'tinderbox12Q6z0ER4vaYOVOnKa0S8WkxoJ').then(function(err, resp) {
      //   if (err) { return console.error(err); }
      //   console.log(resp);
      // });
      // console.log("done");
    }
    return this.connection;
  }

});

export default SalesforceAdapter;