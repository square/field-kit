A         = 65
Y         = 89
Z         = 90
ZERO      = 48
NINE      = 57
LEFT      = 37
RIGHT     = 39
UP        = 38
DOWN      = 40
BACKSPACE = 8
DELETE    = 46
TAB       = 9
ENTER     = 13

KEYS = {
  A
  Y
  Z
  ZERO
  NINE
  LEFT
  RIGHT
  UP
  DOWN
  BACKSPACE
  DELETE
  TAB
  ENTER

  isDigit: (keyCode) ->
    @ZERO <= keyCode <= @NINE

  isDirectional: (keyCode) ->
    keyCode in [@LEFT, @RIGHT, @UP, @DOWN]
}

CTRL  = 1 << 0
META  = 1 << 1
ALT   = 1 << 2
SHIFT = 1 << 3


cache = {}

# Builds a BindingSet based on the current platform.
#
# platform - A string name of a platform (e.g. "OSX").
#
# Returns a BindingSet with keybindings appropriate for the given platform.
keyBindingsForPlatform = (platform) ->
  osx = platform is 'OSX'
  ctrl = if osx then META else CTRL

  cache[platform] ||= build platform, (bind) ->
    bind A         , ctrl       , 'selectAll'
    bind LEFT      , null       , 'moveLeft'
    bind LEFT      , ALT        , 'moveWordLeft'
    bind LEFT      , SHIFT      , 'moveLeftAndModifySelection'
    bind LEFT      , ALT|SHIFT  , 'moveWordLeftAndModifySelection'
    bind LEFT      , META       , 'moveToBeginningOfLine'                        if osx
    bind LEFT      , META|SHIFT , 'moveToBeginningOfLineAndModifySelection'      if osx
    bind RIGHT     , null       , 'moveRight'
    bind RIGHT     , ALT        , 'moveWordRight'
    bind RIGHT     , SHIFT      , 'moveRightAndModifySelection'
    bind RIGHT     , ALT|SHIFT  , 'moveWordRightAndModifySelection'
    bind RIGHT     , META       , 'moveToEndOfLine'                              if osx
    bind RIGHT     , META|SHIFT , 'moveToEndOfLineAndModifySelection'            if osx
    bind UP        , null       , 'moveUp'
    bind UP        , ALT        , 'moveToBeginningOfParagraph'
    bind UP        , SHIFT      , 'moveUpAndModifySelection'
    bind UP        , ALT|SHIFT  , 'moveParagraphBackwardAndModifySelection'
    bind UP        , META       , 'moveToBeginningOfDocument'                    if osx
    bind UP        , META|SHIFT , 'moveToBeginningOfDocumentAndModifySelection'  if osx
    bind DOWN      , null       , 'moveDown'
    bind DOWN      , ALT        , 'moveToEndOfParagraph'
    bind DOWN      , SHIFT      , 'moveDownAndModifySelection'
    bind DOWN      , ALT|SHIFT  , 'moveParagraphForwardAndModifySelection'
    bind DOWN      , META       , 'moveToEndOfDocument'                          if osx
    bind DOWN      , META|SHIFT , 'moveToEndOfDocumentAndModifySelection'        if osx
    bind BACKSPACE , null       , 'deleteBackward'
    bind BACKSPACE , SHIFT      , 'deleteBackward'
    bind BACKSPACE , ALT        , 'deleteWordBackward'
    bind BACKSPACE , ALT|SHIFT  , 'deleteWordBackward'
    bind BACKSPACE , CTRL       , 'deleteBackwardByDecomposingPreviousCharacter' if osx
    bind BACKSPACE , CTRL|SHIFT , 'deleteBackwardByDecomposingPreviousCharacter' if osx
    bind BACKSPACE , ctrl       , 'deleteBackwardToBeginningOfLine'
    bind BACKSPACE , ctrl|SHIFT , 'deleteBackwardToBeginningOfLine'
    bind DELETE    , null       , 'deleteForward'
    bind DELETE    , ALT        , 'deleteWordForward'
    bind TAB       , null       , 'insertTab'
    bind TAB       , SHIFT      , 'insertBackTab'
    bind ENTER     , null       , 'insertNewline'
    bind Z         , ctrl       , 'undo'
    bind Z         , META|SHIFT , 'redo'                                         if osx
    bind Y         , CTRL       , 'redo'                                         unless osx

build = (platform, callback) ->
  result = new BindingSet(platform)
  callback (args...) -> result.bind(args...)
  return result

class BindingSet
  platform: null
  bindings: null

  constructor: (@platform) ->
    @bindings = {}

  bind: (keyCode, modifiers, action) ->
    (@bindings[keyCode] ||= {})[modifiers or 0] = action

  actionForEvent: (event) ->
    if bindingsForKeyCode = @bindings[event.keyCode]
      modifiers = 0
      modifiers |= ALT   if event.altKey
      modifiers |= CTRL  if event.ctrlKey
      modifiers |= META  if event.metaKey
      modifiers |= SHIFT if event.shiftKey
      return bindingsForKeyCode[modifiers]

module.exports = { KEYS, keyBindingsForPlatform }
