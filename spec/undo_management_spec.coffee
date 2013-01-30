UndoManager = require '../lib/undo_manager'

class Shoe
  _size: 0

  constructor: ->
    # This is here so our test can omit getters on the object.
    @__defineGetter__ 'getterOnObject', -> -> 99

  size: ->
    @_size

  setSize: (size) ->
    @_undoProxy.setSize(@_size)
    @_size = size

  undoManager: ->
    @_undoManager

  setUndoManager: (@_undoManager) ->
    @_undoProxy = @_undoManager.proxyFor(this)

  # This is here so our test can omit getters in the prototype.
  @::__defineGetter__ 'getterOnPrototype', -> -> 42

describe 'UndoManager', ->
  undoManager = null
  shoe = null

  beforeEach ->
    undoManager = new UndoManager()
    shoe = new Shoe()
    shoe.setUndoManager undoManager

  describe '#canUndo', ->
    it 'is false when no undos have been registered', ->
      expect(undoManager.canUndo()).toBeFalsy()

    describe 'after registering an undo', ->
      beforeEach ->
        shoe.setSize 20

      it 'is true', ->
        expect(undoManager.canUndo()).toBeTruthy()

      describe 'and after undoing the registered undo', ->
        beforeEach ->
          undoManager.undo()

        it 'is false again', ->
          expect(undoManager.canUndo()).toBeFalsy()

  describe '#canRedo', ->
    it 'is false when no undos have been performed', ->
      expect(undoManager.canRedo()).toBeFalsy()

    describe 'after undoing', ->
      beforeEach ->
        shoe.setSize 20
        undoManager.undo()

      it 'is true', ->
        expect(undoManager.canRedo()).toBeTruthy()

      describe 'and after making another change', ->
        beforeEach ->
          shoe.setSize 30

        it 'is false', ->
          expect(undoManager.canRedo()).toBeFalsy()

  describe '#undo', ->
    describe 'when there are no registered undos', ->
      it 'will raise an error', ->
        expect(-> undoManager.undo()).toThrow('there are no registered undos')

    describe 'when there are registered undos', ->
      beforeEach ->
        shoe.setSize 1
        shoe.setSize 2

      it 'reverts the values in reverse order', ->
        undoManager.undo()
        expect(shoe.size()).toEqual(1)
        undoManager.undo()
        expect(shoe.size()).toEqual(0)

  describe '#redo', ->
    describe 'when nothing has been undone', ->
      it 'will raise an error', ->
        expect(-> undoManager.redo()).toThrow('there are no registered redos')

    describe 'when something has been undone', ->
      beforeEach ->
        shoe.setSize 20
        undoManager.undo()

      it 'changes the value back to before the undo', ->
        expect(shoe.size()).toEqual(0)
        undoManager.redo()
        expect(shoe.size()).toEqual(20)

  describe '#proxyFor', ->
    it 'proxies all properties that are not functions or getters', ->
      proxy = undoManager.proxyFor(shoe)
      expect(proxy.size).toBeDefined()
      expect(proxy.setSize).toBeDefined()
      expect(proxy.getterOnPrototype).not.toBeDefined()
      expect(proxy.getterOnObject).not.toBeDefined()
