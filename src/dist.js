import FieldKit from './';

if (typeof define === 'function' && define.amd) {
  define(() => FieldKit);
} else if (typeof window !== 'undefined') {
  window.FieldKit = FieldKit;
}

module.exports = FieldKit;
