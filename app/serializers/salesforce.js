import DS from 'ember-data';

export default DS.JSONSerializer.extend({
  primaryKey: 'Id',
  extractSingle: function(store, type, payload) {
    debugger;
    /* For extractSave and extractUpdateRecord */
    if ( payload.id ) {
      payload.Id = payload.id;
    }
    return this._super(store, type, payload);
  }
});
