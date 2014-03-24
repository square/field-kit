/* jshint undef:true, node:true */
/* global before */

// Keep a flat list of all event listeners. It's really inefficient but it's not
// really important since this is just for tests.
var registry = [];

/**
 * Public: Adds an event listener to an element.
 *
 * Examples
 *
 *   # add a listener
 *   events.add(element, "click", mycallbackfn)
 *
 *   # add a listener with a namespace
 *   events.add(element, "click.foo", mycallbackfn)
 *
 * Returns nothing.
 */
function add(element, type, callback) {
  var pair = splitTypeAndNamespace(type);
  type = pair[0];
  var namespace = pair[1];
  registry.push({
    element: element,
    type: type,
    namespace: namespace,
    callback: callback
  });
  element.addEventListener(type, callback);
  return null;
}

/*
 * Public: Removes event listeners from elements.
 *
 * Examples
 *
 *   # remove all listeners from all elements
 *   events.remove()
 *
 *   # remove all listeners from a specific element
 *   events.remove(element)
 *
 *   # remove all listeners of a specific type from an element
 *   events.remove(element, "click")
 *
 *   # removes all listerers with a given namespace from an element
 *   events.remove(element, ".mynamespace")
 *
 *   # removes all listeners with a specific type and namespace from an element
 *   events.remove(element, "click.foo")
 *
 *   # removes a specific listener from an element
 *   events.remove(element, "click", mycallbackfn)
 *
 * Returns nothing.
 */
function remove(element, type, callback) {
  var pair = splitTypeAndNamespace(type);
  type = pair[0];
  var namespace = pair[1];
  var newRegistry = [];
  for (var i = 0, l = registry.length; i < l; i++) {
    var entry = registry[i];
    if (!element || element === entry.element) {
      if (!type || type === entry.type) {
        if (!namespace || namespace === entry.namespace) {
          if (!callback || callback === entry.callback) {
            entry.element.removeListener(entry.type, entry.callback);
            continue;
          }
        }
      }
    }
    newRegistry.push(entry);
  }
  registry = newRegistry;
  return null;
}

/*
 * Internal: Splits a compound event type string into its components.
 *
 * Examples
 *
 *   >> splitTypeAndNamespace("click")
 *   => ["click", ""]
 *
 *   >> splitTypeAndNamespace("click.foo")
 *   => ["click", "foo"]
 *
 *   >> splitTypeAndNamespace(".foo")
 *   => ["", ".foo"]
 *
 * Returns a 2-tuple with type and namespace.
 */
function splitTypeAndNamespace(type) {
  if (type === undefined || type === null) {
    return ['', ''];
  }
  var namespace;
  var dotPosition = type.indexOf('.');
  if (dotPosition >= 0) {
    namespace = type.slice(dotPosition+1);
    type = type.slice(0, dotPosition);
  }
  return [type, namespace || ''];
}

// Remove all event listeners before each test run.
before(remove);

module.exports = { add: add, remove: remove };
