

<!-- Start lib/keybindings.js -->

## A

## isDigit(keyCode)

### Params: 

* **Number** *keyCode* 

### Return:

* **Boolean** 

## isDirectional(keyCode)

Is an arrow keyCode.

### Params: 

* **Number** *keyCode* 

### Return:

* **Boolean** 

## keyBindingsForPlatform 
Builds a BindingSet based on the current platform.
(platform)

### Params: 

* **string** *platform* A string name of a platform (e.g. "OSX").

### Return:

* **BindingSet** keybindings appropriate for the given platform.

## BindingSet

### Params: 

* **String** *platform* 

## bind (keyCode, modifiers, action)

### Params: 

* **Number** *keyCode* 
* **Number** *modifiers* 
* **String** *action* 

## actionForEvent (event)

### Params: 

* **Event** *event* 

### Return:

* **?String** 

<!-- End lib/keybindings.js -->

