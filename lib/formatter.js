/* jshint esnext:true, undef:true, unused:true */

class Formatter {
  format(text) {
    if (text === undefined || text === null) { text = ''; }
    if (this.maximumLength !== undefined && this.maximumLength !== null) {
      text = text.substring(0, this.maximumLength);
    }
    return text;
  }

  parse(text) {
    if (text === undefined || text === null) { text = ''; }
    if (this.maximumLength !== undefined && this.maximumLength !== null) {
      text = text.substring(0, this.maximumLength);
    }
    return text;
  }

  isChangeValid(change) {
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
  }
}

export default Formatter;
