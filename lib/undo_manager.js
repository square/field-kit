/* jshint esnext:true */

function hasGetter(object, property) {
  // Skip if getOwnPropertyDescriptor throws (IE8)
  try {
    Object.getOwnPropertyDescriptor({}, 'sq');
  } catch (e) {
    return false;
  }

  var descriptor;

  if (object && object.constructor && object.constructor.prototype) {
    descriptor = Object.getOwnPropertyDescriptor(object.constructor.prototype, property);
  }

  if (!descriptor) {
    descriptor = Object.getOwnPropertyDescriptor(object, property);
  }

  if (descriptor && descriptor.get) {
    return true;
  } else {
    return false;
  }
}

/**
 * UndoManager is a general-purpose recorder of operations for undo and redo.
 *
 * Registering an undo action is done by specifying the changed object, along
 * with a method to invoke to revert its state and the arguments for that
 * method. When performing undo an UndoManager saves the operations reverted so
 * that you can redo the undos.
 */
class UndoManager {
  constructor() {
    this._undos = [];
    this._redos = [];
    this._isUndoing = false;
    this._isRedoing = false;
  }

  /**
   * Determines whether there are any undo actions on the stack.
   *
   * @return {boolean}
   */
  canUndo() {
    return this._undos.length !== 0;
  }

  /**
   * Determines whether there are any redo actions on the stack.
   *
   * @return {boolean}
   */
  canRedo() {
    return this._redos.length !== 0;
  }

  /**
   * Indicates whether or not this manager is currently processing an undo.
   *
   * @return {boolean}
   */
  isUndoing() {
    return this._isUndoing;
  }

  /**
   * Indicates whether or not this manager is currently processing a redo.
   *
   * @return {boolean}
   */
  isRedoing() {
    return this._isRedoing;
  }

  /**
   * Manually registers an simple undo action with the given args.
   *
   * If this undo manager is currently undoing then this will register a redo
   * action instead. If this undo manager is neither undoing or redoing then the
   * redo stack will be cleared.
   *
   * @param {object} target call `selector` on this object
   * @param {string} selector the method name to call on `target`
   * @param {object...} args arguments to pass when calling `selector` on `target`
   */
  registerUndo() {
    if (this._isUndoing) {
      this._appendRedo.apply(this, arguments);
    } else {
      if (!this._isRedoing) {
        this._redos.length = 0;
      }
      this._appendUndo.apply(this, arguments);
    }
    return null;
  }

  /**
   * Appends an undo action to the internal stack.
   *
   * @private
   */
  _appendUndo(target, selector) {
    this._undos.push({
      target: target,
      selector: selector,
      args: [].slice.call(arguments, 2)
    });
  }

  /**
   * Appends a redo action to the internal stack.
   *
   * @private
   */
  _appendRedo(target, selector) {
    this._redos.push({
      target: target,
      selector: selector,
      args: [].slice.call(arguments, 2)
    });
  }

  /**
   * Performs the top-most undo action on the stack.
   *
   * Raises an error if there are no available undo actions.
   */
  undo() {
    if (!this.canUndo()) {
      throw new Error('there are no registered undos');
    }
    var data = this._undos.pop();
    var target = data.target;
    var selector = data.selector;
    var args = data.args;
    this._isUndoing = true;
    target[selector].apply(target, args);
    this._isUndoing = false;
  }

  /**
   * Performs the top-most redo action on the stack.
   *
   * Raises an error if there are no available redo actions.
   */
  redo() {
    if (!this.canRedo()) {
      throw new Error('there are no registered redos');
    }
    var data = this._redos.pop();
    var target = data.target;
    var selector = data.selector;
    var args = data.args;
    this._isRedoing = true;
    target[selector].apply(target, args);
    this._isRedoing = false;
    return null;
  }

  /**
   * Returns a proxy object based on target that will register undo/redo actions
   * by calling methods on the proxy.
   *
   * Example
   *
   *   setSize: (size) ->
   *     @undoManager.proxyFor(this).setSize(@_size)
   *     @_size = size
   *
   */
  proxyFor(target) {
    var proxy = {};
    var self = this;

    function proxyMethod(selector) {
      return function() {
        self.registerUndo.apply(
          self,
          [target, selector].concat([].slice.call(arguments))
        );
      };
    }

    for (var selector in target) {
      // don't trigger anything that has a getter
      if (hasGetter(target, selector)) { continue; }

      // don't try to proxy properties that aren't functions
      if (typeof target[selector] !== 'function') { continue; }

      // set up a proxy function to register an undo
      proxy[selector] = proxyMethod(selector);
    }
    return proxy;
  }
}

module.exports = UndoManager;
