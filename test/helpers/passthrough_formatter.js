/* jshint esnext:true, unused:true, undef:true */

class PassthroughFormatter {
  format(value) {
    return value;
  }

  parse(text) {
    return text;
  }
}

export default PassthroughFormatter;
