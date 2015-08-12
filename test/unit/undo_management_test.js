/* global describe, beforeEach, it, expect */

import FieldKit from '../../src';
import {expect} from 'chai';

function Shoe() {
  // This is here so our test can omit getters on the object.
  Object.defineProperty(this, 'getterOnObject', { get: function(){ return 99; } });
}

Shoe.prototype._size = 0;

Shoe.prototype.size = function() {
  return this._size;
};

Shoe.prototype.setSize = function(size) {
  this._undoProxy.setSize(this._size);
  this._size = size;
};

Shoe.prototype.undoManager = function() {
  return this._undoManager;
};

Shoe.prototype.setUndoManager = function(undoManager) {
  this._undoManager = undoManager;
  this._undoProxy = this._undoManager.proxyFor(this);
};

// This is here so our test can omit getters in the prototype.
Object.defineProperty(Shoe.prototype, 'getterOnPrototype', { get: function(){ return 42; } });

testsWithAllKeyboards('FieldKit.UndoManager', function() {
  var undoManager;
  var shoe;

  beforeEach(function() {
    undoManager = new FieldKit.UndoManager();
    shoe = new Shoe();
    shoe.setUndoManager(undoManager);
  });

  describe('#canUndo', function() {
    it('is false when no undos have been registered', function() {
      expect(undoManager.canUndo()).to.be.false;
    });

    describe('after registering an undo', function() {
      beforeEach(function() {
        shoe.setSize(20);
      });

      it('is true', function() {
        expect(undoManager.canUndo()).to.be.true;
      });

      describe('and after undoing the registered undo', function() {
        beforeEach(function() {
          undoManager.undo();
        });

        it('is false again', function() {
          expect(undoManager.canUndo()).to.be.false;
        });
      });
    });
  });

  describe('#canRedo', function() {
    it('is false when no undos have been performed', function() {
      expect(undoManager.canRedo()).to.be.false;
    });

    describe('after undoing', function() {
      beforeEach(function() {
        shoe.setSize(20);
        undoManager.undo();
      });

      it('is true', function() {
        expect(undoManager.canRedo()).to.be.true;
      });

      describe('and after making another change', function() {
        beforeEach(function() {
          shoe.setSize(30);
        });

        it('is false', function() {
          expect(undoManager.canRedo()).to.be.false;
        });
      });
    });
  });

  describe('#undo', function() {
    describe('when there are no registered undos', function() {
      it('will raise an error', function() {
        try {
          undoManager.undo();
          throw new Error('this should have thrown an exception');
        } catch (ex) {
          expect(ex.message).to.equal('there are no registered undos');
        }
      });
    });

    describe('when there are registered undos', function() {
      beforeEach(function() {
        shoe.setSize(1);
        shoe.setSize(2);
      });

      it('reverts the values in reverse order', function() {
        undoManager.undo(); // 2 -> 1
        expect(shoe.size()).to.equal(1);
        undoManager.undo(); // 1 -> 0
        expect(shoe.size()).to.equal(0);
      });
    });
  });

  describe('#redo', function() {
    describe('when nothing has been undone', function() {
      it('will raise an error', function() {
        try {
          undoManager.redo();
          throw new Error('this should have thrown an exception');
        } catch (ex) {
          expect(ex.message).to.equal('there are no registered redos');
        }
      });
    });

    describe('when something has been undone', function() {
      beforeEach(function() {
        shoe.setSize(20);
        undoManager.undo();
      });

      it('changes the value back to before the undo', function() {
        expect(shoe.size()).to.equal(0);
        undoManager.redo();
        expect(shoe.size()).to.equal(20);
      });
    });
  });

  describe('#proxyFor', function() {
    it('proxies all properties that are not functions or getters', function() {
      var proxy = undoManager.proxyFor(shoe);
      expect(proxy.size).to.be.defined;
      expect(proxy.setSize).to.be.defined;
      expect(proxy.getterOnPrototype).not.to.be.defined;
      expect(proxy.getterOnObject).not.to.be.defined;
    });
  });
});
