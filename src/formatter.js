/**
 * Base class providing basic formatting, parsing, and change validation to be
 * customized in subclasses.
 */
class Formatter {
  /**
   * @param {string} text
   * @returns {string}
   */
  format(text) {
    if (text === undefined || text === null) { text = ''; }
    if (this.maximumLength !== undefined && this.maximumLength !== null) {
      text = text.substring(0, this.maximumLength);
    }
    return text;
  }

  /**
   * @param {string} text
   * @returns {string}
   */
  parse(text) {
    if (text === undefined || text === null) { text = ''; }
    if (this.maximumLength !== undefined && this.maximumLength !== null) {
      text = text.substring(0, this.maximumLength);
    }
    return text;
  }

  /**
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @returns {boolean}
   */
  isChangeValid(change) {
    const selectedRange = change.proposed.selectedRange;
    const text = change.proposed.text;
    if (this.maximumLength !== undefined && this.maximumLength !== null && text.length > this.maximumLength) {
      const available = this.maximumLength - (text.length - change.inserted.text.length);
      let newText = change.current.text.substring(0, change.current.selectedRange.start);
      if (available > 0) {
        newText += change.inserted.text.substring(0, available);
      }
      newText += change.current.text.substring(change.current.selectedRange.start + change.current.selectedRange.length);
      const truncatedLength = text.length - newText.length;
      change.proposed.text = newText;
      selectedRange.start -= truncatedLength;
    }
    return true;
  }
}

export default Formatter;
