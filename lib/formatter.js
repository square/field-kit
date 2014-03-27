function Formatter() {}

Formatter.prototype.maximumLength = null;

Formatter.prototype.format = function(text) {
  if (text === undefined || text === null) { text = ''; }
  if (this.maximumLength !== undefined && this.maximumLength !== null) {
    text = text.substring(0, this.maximumLength);
  }
  return text;
};

Formatter.prototype.parse = function(text, error) {
  if (text === undefined || text === null) { text = ''; }
  if (this.maximumLength !== undefined && this.maximumLength !== null) {
    text = text.substring(0, this.maximumLength);
  }
  return text;
};

Formatter.prototype.isChangeValid = function(change, error) {
  var selectedRange = change.proposed.selectedRange;
  var text = change.proposed.text;
  if (this.maximumLength !== undefined && this.maximumLength !== null && text.length > this.maximumLength) {
    var available = this.maximumLength - (text.length - change.inserted.text.length);
    var newText = change.current.text.substring(0, change.current.selectedRange.start);
    if (available > 0) {
      newText += change.inserted.text.substring(0, available);
    }
    newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length);
    var truncatedLength = text.length - newText.length;
    change.proposed.text = newText;
    selectedRange.start -= truncatedLength;
  }
  return true;
};

module.exports = Formatter;
