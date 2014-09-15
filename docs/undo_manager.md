

<!-- Start lib/undo_manager.js -->

jshint esnext:true, undef:true, unused:true

## UndoManager

UndoManager is a general-purpose recorder of operations for undo and redo.

Registering an undo action is done by specifying the changed object, along
with a method to invoke to revert its state and the arguments for that
method. When performing undo an UndoManager saves the operations reverted so
that you can redo the undos.

## canUndo 
Determines whether there are any undo actions on the stack.
()

### Return:

* **Boolean** 

## canRedo 
Determines whether there are any redo actions on the stack.
()

### Return:

* **Boolean** 

## isUndoing 
Indicates whether or not this manager is currently processing an undo.
()

### Return:

* **Boolean** 

## isRedoing 
Indicates whether or not this manager is currently processing a redo.
()

### Return:

* **Boolean** 

## registerUndo 
Manually registers an simple undo action with the given args.

If this undo manager is currently undoing then this will register a redo
action instead. If this undo manager is neither undoing or redoing then the
redo stack will be cleared.
(target, selector, args)

### Params: 

* **Object** *target* call `selector` on this object
* **String** *selector* the method name to call on `target`
* **Object...** *args* arguments to pass when calling `selector` on `target`

## _appendUndo 
Appends an undo action to the internal stack.
(target, selector, args)

### Params: 

* **Object** *target* call `selector` on this object
* **String** *selector* the method name to call on `target`
* **Object...** *args* arguments to pass when calling `selector` on `target`

## _appendRedo 
Appends a redo action to the internal stack.
(target, selector, args)

### Params: 

* **Object** *target* call `selector` on this object
* **String** *selector* the method name to call on `target`
* **Object...** *args* arguments to pass when calling `selector` on `target`

## undo 
Performs the top-most undo action on the stack.
()

## redo 
Performs the top-most redo action on the stack.
()

## proxyFor 
Returns a proxy object based on target that will register undo/redo actions
by calling methods on the proxy.

### Example
    setSize(size) {
      this.undoManager.proxyFor(this).setSize(this._size);
      this._size = size;
    }
(target)

### Params: 

* **Object** *target* call `selector` on this object

<!-- End lib/undo_manager.js -->

