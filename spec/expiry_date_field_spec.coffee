ExpiryDateField = require '../lib/expiry_date_field'
{buildField} = require './helpers/builders'
{expectThatLeaving} = require './helpers/expectations'

describe 'ExpiryDateField', ->
  field = null

  beforeEach ->
    field = buildField ExpiryDateField

  it 'interprets a single digit year as if it had zero prefixed', ->
    # NOTE: this probably ought to result in '12/04|', but changing the caret
    # during the blur event makes Chrome unhappy.
    expectThatLeaving(field).willChange('12/4|').to('12/0|4')

  it 'leaves unparseable values alone on end edit', ->
    expectThatLeaving(field).willNotChange('4|')
