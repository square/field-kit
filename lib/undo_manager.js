'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

/**
 * UndoManager is a general-purpose recorder of operations for undo and redo.
 *
 * Registering an undo action is done by specifying the changed object, along
 * with a method to invoke to revert its state and the arguments for that
 * method. When performing undo an UndoManager saves the operations reverted so
 * that you can redo the undos.
 */

var UndoManager = (function () {
  function UndoManager() {
    _classCallCheck(this, UndoManager);

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

  _createClass(UndoManager, [{
    key: 'canUndo',
    value: function canUndo() {
      return this._undos.length !== 0;
    }

    /**
     * Determines whether there are any redo actions on the stack.
     *
     * @returns {boolean}
     */
  }, {
    key: 'canRedo',
    value: function canRedo() {
      return this._redos.length !== 0;
    }

    /**
     * Indicates whether or not this manager is currently processing an undo.
     *
     * @returns {boolean}
     */
  }, {
    key: 'isUndoing',
    value: function isUndoing() {
      return this._isUndoing;
    }

    /**
     * Indicates whether or not this manager is currently processing a redo.
     *
     * @returns {boolean}
     */
  }, {
    key: 'isRedoing',
    value: function isRedoing() {
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
  }, {
    key: 'registerUndo',
    value: function registerUndo(target, selector) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      if (this._isUndoing) {
        this._appendRedo.apply(this, [target, selector].concat(args));
      } else {
        if (!this._isRedoing) {
          this._redos.length = 0;
        }
        this._appendUndo.apply(this, [target, selector].concat(args));
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
  }, {
    key: '_appendUndo',
    value: function _appendUndo(target, selector) {
      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

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
  }, {
    key: '_appendRedo',
    value: function _appendRedo(target, selector) {
      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

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
  }, {
    key: 'undo',
    value: function undo() {
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
     * @throws {Error} Raises an error if there are no available redo actions.
     */
  }, {
    key: 'redo',
    value: function redo() {
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
  }, {
    key: 'proxyFor',
    value: function proxyFor(target) {
      var proxy = {};
      var self = this;

      function proxyMethod(selector) {
        return function () {
          for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
            args[_key4] = arguments[_key4];
          }

          self.registerUndo.apply(self, [target, selector].concat(args));
        };
      }

      (0, _utils.getAllPropertyNames)(target).forEach(function (selector) {
        // don't trigger anything that has a getter
        if ((0, _utils.hasGetter)(target, selector)) {
          return;
        }

        // don't try to proxy properties that aren't functions
        if (typeof target[selector] !== 'function') {
          return;
        }

        // set up a proxy function to register an undo
        proxy[selector] = proxyMethod(selector);
      });

      return proxy;
    }
  }]);

  return UndoManager;
})();

exports['default'] = UndoManager;
module.exports = exports['default'];