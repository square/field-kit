# NOTE: This file has the "_spec" suffix because we want Jasmine to load it
# without having to require it explicitly from other spec files.

originalEmitObject = jasmine.StringPrettyPrinter.prototype.emitObject

jasmine.StringPrettyPrinter.prototype.emitObject = (obj) ->
  if typeof obj.inspect is 'function'
    @append obj.inspect()
  else
    originalEmitObject.call this, obj

beforeEach ->
  @addMatchers
    toBeAnInstanceOf: (constructor) ->
      @message = =>
        [
          "Expected " + @actual?.constructor?.name + " to be an instance of " + constructor.name
          "Expected " + @actual?.constructor?.name + " not to be an instance of " + constructor.name
        ]
      return @actual instanceof constructor
