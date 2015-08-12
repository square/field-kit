import chai from 'chai';
import Selection from 'string-selection'

chai.use(function (_chai, utils) {
  utils.addMethod(chai.Assertion.prototype, 'selected', function (description) {
    var inputText = this._obj.text();
    var inputSelectedRange = this._obj.selectedRange();
    var inputSelectedEnd = inputSelectedRange.start + inputSelectedRange.length;
    var inputDescription = Selection.printDescription({
      caret: {
        start: inputSelectedRange.start,
        end: inputSelectedEnd
      },
      value: inputText,
      affinity: this._obj.selectionAffinity
    });

    this.assert(
      inputDescription === description,
      "expected #{exp} to be '" + inputDescription + "'",
      "expected #{exp} not to be '" + inputDescription + "'",
      description
    );
  });
});

export default Selection;
