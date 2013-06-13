# Keep a flat list of all event listeners. It's really inefficient but it's not
# really important since this is just for tests.
registry = []

# Public: Adds an event listener to an element.
#
# Examples
#
#   # add a listener
#   events.add(element, "click", mycallbackfn)
#
#   # add a listener with a namespace
#   events.add(element, "click.foo", mycallbackfn)
#
# Returns nothing.
add = (element, type, callback) ->
  [type, namespace] = splitTypeAndNamespace type
  registry.push { element, type, namespace, callback }
  element.addEventListener type, callback
  return null

# Public: Removes event listeners from elements.
#
# Examples
#
#   # remove all listeners from all elements
#   events.remove()
#
#   # remove all listeners from a specific element
#   events.remove(element)
#
#   # remove all listeners of a specific type from an element
#   events.remove(element, "click")
#
#   # removes all listerers with a given namespace from an element
#   events.remove(element, ".mynamespace")
#
#   # removes all listeners with a specific type and namespace from an element
#   events.remove(element, "click.foo")
#
#   # removes a specific listener from an element
#   events.remove(element, "click", mycallbackfn)
#
# Returns nothing.
remove = (element, type, callback) ->
  [type, namespace] = splitTypeAndNamespace type
  newRegistry = []
  for entry in registry
    if not element or element is entry.element
      if not type or type is entry.type
        if not namespace or namespace is entry.namespace
          if not callback or callback is entry.callback
            entry.element.removeListener entry.type, entry.callback
            continue
    newRegistry.push entry
  registry = newRegistry
  return null

# Internal: Splits a compound event type string into its components.
#
# Examples
#
#   >> splitTypeAndNamespace("click")
#   => ["click", ""]
#
#   >> splitTypeAndNamespace("click.foo")
#   => ["click", "foo"]
#
#   >> splitTypeAndNamespace(".foo")
#   => ["", ".foo"]
#
# Returns a 2-tuple with type and namespace.
splitTypeAndNamespace = (type) ->
  return ['', ''] unless type?
  dotPosition = type.indexOf('.')
  if dotPosition >= 0
    namespace = type[dotPosition+1..]
    type = type[0...dotPosition]
  return [type, namespace or '']

# Remove all event listeners before each test run.
beforeEach ->
  remove()

module.exports = { add, remove }
