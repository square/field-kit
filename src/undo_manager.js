import { getAllPropertyNames, hasGetter } from './utils';

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
    /** @private */
    this._undos = [];
    /** @private */
    this._redos = [];
    /** @private */
    this._isUndoing = false;
    /** @private */
    this._isRedoing = false;
  }

  /**
   * Determines whether there are any undo actions on the stack.
   *
   * @returns {boolean}
   */
  canUndo() {
    return this._undos.length !== 0;
  }

  /**
   * Determines whether there are any redo actions on the stack.
   *
   * @returns {boolean}
   */
  canRedo() {
    return this._redos.length !== 0;
  }

  /**
   * Indicates whether or not this manager is currently processing an undo.
   *
   * @returns {boolean}
   */
  isUndoing() {
    return this._isUndoing;
  }

  /**
   * Indicates whether or not this manager is currently processing a redo.
   *
   * @returns {boolean}
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
   * @param {Object} target call `selector` on this object
   * @param {string} selector the method name to call on `target`
   * @param {...Object} args arguments to pass when calling `selector` on `target`
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
  }

  /**
   * Appends an undo action to the internal stack.
   *
   * @param {Object} target call `selector` on this object
   * @param {string} selector the method name to call on `target`
   * @param {...Object} args arguments to pass when calling `selector` on `target`
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
   * Appends a redo action to the internal stack.
   *
   * @param {Object} target call `selector` on this object
   * @param {string} selector the method name to call on `target`
   * @param {...Object} args arguments to pass when calling `selector` on `target`
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
   * Performs the top-most undo action on the stack.
   *
   * @throws {Error} Raises an error if there are no available undo actions.
   */
  undo() {
    if (!this.canUndo()) {
      throw new Error('there are no registered undos');
    }
    const data = this._undos.pop();
    const target = data.target;
    const selector = data.selector;
    const args = data.args;
    this._isUndoing = true;
    target[selector].apply(target, args);
    this._isUndoing = false;
  }

  /**
   * Performs the top-most redo action on the stack.
   *
   * @throws {Error} Raises an error if there are no available redo actions.
   */
  redo() {
    if (!this.canRedo()) {
      throw new Error('there are no registered redos');
    }
    const data = this._redos.pop();
    const target = data.target;
    const selector = data.selector;
    const args = data.args;
    this._isRedoing = true;
    target[selector].apply(target, args);
    this._isRedoing = false;
  }

  /**
   * Returns a proxy object based on target that will register undo/redo actions
   * by calling methods on the proxy.
   *
   * @example
   *     setSize(size) {
   *       this.undoManager.proxyFor(this).setSize(this._size);
   *       this._size = size;
   *     }
   *
   * @param {Object} target call `selector` on this object
   * @returns {Object}
   */
  proxyFor(target) {
    const proxy = {};
    const self = this;

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
