{EventEmitter} = require 'events'

class FakeElement extends EventEmitter
  tagName: null
  attributes: null
  childNodes: null
  parentNode: null
  style: null
  selfClosing: no

  constructor: (@ownerDocument, @tagName) ->
    unless @ownerDocument
      throw new Error("cannot create elements without an owner document")

    unless @tagName
      throw new Error("cannot create elements without a tag name")

    @attributes = {}
    @childNodes = []
    @style = {}

  getAttribute: (name) ->
    @attributes[name]

  setAttribute: (name, value) ->
    @attributes[name] = "#{value}"

  insertBefore: (newChild, referenceChild) ->
    @reparent newChild, =>
      referenceIndex = @childNodes.indexOf(referenceChild)
      @childNodes.splice referenceIndex, 0, [newChild]

  appendChild: (child) ->
    @reparent child, =>
      @childNodes.push child

  reparent: (child, callback) ->
    if child.ownerDocument isnt @ownerDocument
      throw new Error('cannot append child node from another document')

    if child.parentNode is this
      index = @childNodes.indexOf(child)
      @childNodes.splice index, 1

    if child.parentNode
      child.parentNode.removeChild(child)

    callback()

    child.parentNode = this

  @::__defineGetter__ 'nextSibling', ->
    siblingsAndSelf = @parentNode.childNodes
    myIndex = siblingsAndSelf.indexOf(this)
    siblingsAndSelf[myIndex+1]

  @::__defineGetter__ 'previousSibling', ->
    siblingsAndSelf = @parentNode.childNodes
    myIndex = siblingsAndSelf.indexOf(this)
    siblingsAndSelf[myIndex-1]

  toString: ->
    result = "<#{@tagName}"
    result += " #{name}=\"#{value}\"" for own name, value of @attributes

    if @selfClosing
      result += " />"
    else
      result += ">"
      result += child.toString() for child in @childNodes
      result += "</#{@tagName}>"

    return result

module.exports = FakeElement
