import DS from 'ember-data';

export default DS.Model.extend({
  Name: DS.attr('string'),
  BillingCity: DS.attr('string'),
  BillingState: DS.attr('string'),
  BillingPostalCode: DS.attr('string'),
  BillingCountry: DS.attr('string')
});
