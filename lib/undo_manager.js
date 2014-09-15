/* jshint esnext:true, undef:true, unused:true */

import { getAllPropertyNames, hasGetter } from './utils';

/**
 * UndoManager is a general-purpose recorder of operations for undo and redo.
 *
 * Registering an undo action is done by specifying the changed object, along
 * with a method to invoke to revert its state and the arguments for that
 * method. When performing undo an UndoManager saves the operations reverted so
 * that you can redo the undos.
 * @class UndoManager
 * @public
 */
class UndoManager {
  /**
   * @constructor
   */
  constructor() {
    this._undos = [];
    this._redos = [];
    this._isUndoing = false;
    this._isRedoing = false;
  }

  /**
   * @method canUndo
   *
   * Determines whether there are any undo actions on the stack.
   *
   * @return {Boolean}
   * @public
   */
  canUndo() {
    return this._undos.length !== 0;
  }

  /**
   * @method canRedo
   *
   * Determines whether there are any redo actions on the stack.
   *
   * @return {Boolean}
   * @public
   */
  canRedo() {
    return this._redos.length !== 0;
  }

  /**
   * @method isUndoing
   *
   * Indicates whether or not this manager is currently processing an undo.
   *
   * @return {Boolean}
   * @public
   */
  isUndoing() {
    return this._isUndoing;
  }

  /**
   * @method isRedoing
   *
   * Indicates whether or not this manager is currently processing a redo.
   *
   * @return {Boolean}
   * @public
   */
  isRedoing() {
    return this._isRedoing;
  }

  /**
   * @method registerUndo
   *
   * Manually registers an simple undo action with the given args.
   *
   * If this undo manager is currently undoing then this will register a redo
   * action instead. If this undo manager is neither undoing or redoing then the
   * redo stack will be cleared.
   *
   * @param {Object} target call `selector` on this object
   * @param {String} selector the method name to call on `target`
   * @param {Object...} args arguments to pass when calling `selector` on `target`
   * @returns null
   * @public
   */
  registerUndo(target, selector, ...args) {
    if (this._isUndoing) {
      this._appendRedo(target, selector, ...args);
    } else {
      if (!this._isRedoing) {
        this._redos.length = 0;
      }
      this._appendUndo(target, selector, ...args);
    }
    return null;
  }

  /**
   * @method _appendUndo
   *
   * Appends an undo action to the internal stack.
   *
   * @param {Object} target call `selector` on this object
   * @param {String} selector the method name to call on `target`
   * @param {Object...} args arguments to pass when calling `selector` on `target`
   * @private
   */
  _appendUndo(target, selector, ...args) {
    this._undos.push({
      target: target,
      selector: selector,
      args: args
    });
  }

  /**
   * @method _appendRedo
   *
   * Appends a redo action to the internal stack.
   *
   * @param {Object} target call `selector` on this object
   * @param {String} selector the method name to call on `target`
   * @param {Object...} args arguments to pass when calling `selector` on `target`
   * @private
   */
  _appendRedo(target, selector, ...args) {
    this._redos.push({
      target: target,
      selector: selector,
      args: args
    });
  }

  /**
   * @method undo
   *
   * Performs the top-most undo action on the stack.
   *
   * @throws {Error} Raises an error if there are no available undo actions.
   * @public
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
   * @method redo
   *
   * Performs the top-most redo action on the stack.
   *
   * @throws {Error} Raises an error if there are no available redo actions.
   * @returns null
   * @public
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
   * @method proxyFor
   *
   * Returns a proxy object based on target that will register undo/redo actions
   * by calling methods on the proxy.
   *
   * ### Example
   *     setSize(size) {
   *       this.undoManager.proxyFor(this).setSize(this._size);
   *       this._size = size;
   *     }
   *
   * @param {Object} target call `selector` on this object
   * @returns {Object}
   * @public
   */
  proxyFor(target) {
    var proxy = {};
    var self = this;

    function proxyMethod(selector) {
      return function(...args) {
        self.registerUndo(target, selector, ...args);
      };
    }

    getAllPropertyNames(target).forEach(selector => {
      // don't trigger anything that has a getter
      if (hasGetter(target, selector)) { return; }

      // don't try to proxy properties that aren't functions
      if (typeof target[selector] !== 'function') { return; }

      // set up a proxy function to register an undo
      proxy[selector] = proxyMethod(selector);
    });

    return proxy;
  }
}

export default UndoManager;
