Formatter = require '../lib/formatter'
{buildField} = require './helpers/builders'
{expectThatPasting, expectThatTyping} = require './helpers/expectations'

describe 'Formatter', ->
  field = null

  beforeEach ->
    field = buildField()
    field.formatter = new Formatter()

  describe 'when #maximumLength is set', ->
    beforeEach ->
      field.formatter.maximumLength = 3

    it 'allows input that would not make the text longer than the maximum', ->
      expectThatTyping('c').into(field).willChange('ab|').to('abc|')
      expectThatTyping('b').into(field).willChange('a|c').to('ab|c')
      expectThatTyping('c').into(field).willChange('ab|d|').to('abc|')

    it 'prevents input that would make the text longer than the maximum', ->
      expectThatTyping('d').into(field).willNotChange('abc|')
      expectThatTyping('b').into(field).willNotChange('a|cd')
      expectThatTyping('b').into(field).willNotChange('a|cd')

    it 'allows pasted characters up until the maximum', ->
      expectThatPasting('12345').into(field).willChange('a|').to('a12|')
      expectThatPasting('12345').into(field).willChange('a|b|c').to('a1|c')
