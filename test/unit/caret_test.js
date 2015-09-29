import sinon from 'sinon';
import {expect} from 'chai';
import installCaret from '../../src/caret';

describe('Caret', () => {
  describe('with no document', () => {
    it('throws an error', () => {
      expect(() => installCaret(null)).to.throw(/Caret does not have access to document/);
    });
  });

  describe('with no native caret', () => {
    it('throws an error', () => {
      expect(() => installCaret({
        createElement: () => ({})
      })).to.throw(/Caret unknown input selection capabilities/);
    });
  });

  describe('with selectionStart', () => {
    let getCaret, setCaret;

    beforeEach(() => {
      ({getCaret, setCaret} = installCaret({
        createElement: () => ({ selectionStart: true })
      }));
    });

    it('getCaret calls selectionStart and selectionEnd', () => {
      const fakeElement = {
        selectionStart: 4,
        selectionEnd: 8
      };
      expect(getCaret(fakeElement)).to.eql({
        start: 4,
        end: 8
      });
    });

    it('setCaret sets selectionStart and selectionEnd', () => {
      const fakeElement = {
        selectionStart: 4,
        selectionEnd: 8
      };
      setCaret(fakeElement, 1, 5);

      expect(fakeElement).to.eql({
        selectionStart: 1,
        selectionEnd: 5
      });
    });
  });

  describe('with document.selection', function() {
    let getCaret, setCaret;

    beforeEach(() => {
      const selectedText = this.selectedText;
      class TextRange {
        get text() {
          return this.selectedText;
        }

        moveEnd() {
          this.selectedText = selectedText;
        }

        moveStart(noop, negLength) {
          if(selectedText) {
            this.selectedText = selectedText;
          } else {
            this.selectedText = '';
            for(let i = 0; i < -negLength; i++) {
              this.selectedText += 'x';
            }
          }
        }
      }
      ({getCaret, setCaret} = installCaret({
        createElement: () => ({}),
        selection: {
          createRange: () => {
            return {
              duplicate: () => {
                return new TextRange();
              }
            };
          }
        }
      }));
    });

    describe('nothing selected', () => {
      before(() => {
        this.selectedText = '';
      });

      it('getCaret with nothing selected', () => {
        const fakeElement = {
          value: 'delorean'
        };
        expect(getCaret(fakeElement)).to.eql({
          start: 8,
          end: 8
        });
      });
    });

    describe('first half selected', () => {
      before(() => {
        this.selectedText = 'Run For I';
      });

      it('getCaret with nothing selected', () => {
        const fakeElement = {
          value: 'Run For It Marty!'
        };
        expect(getCaret(fakeElement)).to.eql({
          start: 0,
          end: 9
        });
      });
    });
  });
});
