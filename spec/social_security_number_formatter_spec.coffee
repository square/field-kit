SocialSecurityNumberFormatter = require '../lib/social_security_number_formatter'
{buildField} = require './helpers/builders'
{expectThatTyping} = require './helpers/expectations'

describe 'SocialSecurityNumberFormatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new SocialSecurityNumberFormatter()

  it 'places dashes in the right places', ->
    expectThatTyping('123456789'.split('')...).into(field).willChange('|').to('123-45-6789|')

  it 'prevents extra digits from being entered', ->
    expectThatTyping('0').into(field).willNotChange('123-45-6789|')

  it 'prevents entering non-digit characters', ->
    expectThatTyping('f').into(field).willNotChange('|')
