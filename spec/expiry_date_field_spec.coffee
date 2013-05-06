ExpiryDateField = require '../lib/expiry_date_field'
{buildField} = require './helpers/builders'
{expectThatLeaving} = require './helpers/expectations'

describe 'ExpiryDateField', ->
  field = null

  beforeEach ->
    field = buildField ExpiryDateField

  it 'interprets a single digit year as if it had zero prefixed', ->
    expectThatLeaving(field).willChange('12/4|').to('12/04|')
