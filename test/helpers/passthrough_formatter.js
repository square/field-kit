function PassthroughFormatter() {}

PassthroughFormatter.prototype.format = function(value) {
  return value;
};

PassthroughFormatter.prototype.parse = function(text) {
  return text;
};

module.exports = PassthroughFormatter;
