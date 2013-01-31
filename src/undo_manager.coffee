hasGetter = (object, property) ->
  if object?.constructor?.prototype
    return yes if Object.getOwnPropertyDescriptor(object.constructor.prototype, property)?.get
  return Object.getOwnPropertyDescriptor(object, property)?.get?

# UndoManager is a general-purpose recorder of operations for undo and redo.
#
# Registering an undo action is done by specifying the changed object, along
# with a method to invoke to revert its state and the arguments for that
# method. When performing undo an UndoManager saves the operations reverted so
# that you can redo the undos.
class UndoManager
  _undos: null
  _redos: null
  _isUndoing: no
  _isRedoing: no

  constructor: ->
    @_undos = []
    @_redos = []

  # Determines whether there are any undo actions on the stack.
  #
  # Returns true if there are any undo actions, false otherwise.
  canUndo: ->
    @_undos.length isnt 0

  # Determines whether there are any redo actions on the stack.
  #
  # Returns true if there are any redo actions, false otherwise.
  canRedo: ->
    @_redos.length isnt 0

  # Indicates whether or not this manager is currently processing an undo.
  #
  # Returns true if an undo action is currently being run.
  isUndoing: ->
    @_isUndoing

  # Indicates whether or not this manager is currently processing a redo.
  #
  # Returns true if a redo action is currently being run.
  isRedoing: ->
    @_isRedoing

  # Manually registers an simple undo action with the given args.
  #
  # If this undo manager is currently undoing then this will register a redo
  # action instead. If this undo manager is neither undoing or redoing then the
  # redo stack will be cleared.
  #
  # target - An object to send the message given by selector when undoing.
  # selector - A string naming the method to call on the given target.
  # args... - The arguments to pass when calling the selector on target.
  #
  # Returns nothing.
  registerUndo: (target, selector, args...) ->
    if @_isUndoing
      @_appendRedo target, selector, args...
    else
      @_redos.length = 0 unless @_isRedoing
      @_appendUndo target, selector, args...
    return null

  # Internal: Appends an undo action to the internal stack.
  #
  # Returns nothing.
  _appendUndo: (target, selector, args...) ->
    @_undos.push { target, selector, args }

  # Internal: Appends a redo action to the internal stack.
  #
  # Returns nothing.
  _appendRedo: (target, selector, args...) ->
    @_redos.push { target, selector, args }

  # Performs the top-most undo action on the stack.
  #
  # Raises an error if there are no available undo actions.
  # Returns nothing.
  undo: ->
    throw new Error('there are no registered undos') unless @canUndo()
    { target, selector, args } = @_undos.pop()
    @_isUndoing = yes
    target[selector](args...)
    @_isUndoing = no
    return null

  # Performs the top-most redo action on the stack.
  #
  # Raises an error if there are no available redo actions.
  # Returns nothing.
  redo: ->
    throw new Error('there are no registered redos') unless @canRedo()
    { target, selector, args } = @_redos.pop()
    @_isRedoing = yes
    target[selector](args...)
    @_isRedoing = no
    return null

  # Returns a proxy object based on target that will register undo/redo actions
  # by calling methods on the proxy.
  #
  # Example
  #
  #   setSize: (size) ->
  #     @undoManager.proxyFor(this).setSize(@_size)
  #     @_size = size
  #
  # Returns the proxy.
  proxyFor: (target) ->
    proxy = {}
    for selector of target
      # don't trigger anything that has a getter
      continue if hasGetter(target, selector)
      # don't try to proxy properties that aren't functions
      continue if typeof target[selector] isnt 'function'
      # set up a proxy function to register an undo
      do (selector) =>
        proxy[selector] = (args...) =>
          @registerUndo target, selector, args...
    return proxy

module.exports = UndoManager
