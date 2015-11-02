import DelimitedTextFormatter from './delimited_text_formatter';

/**
 * @const
 * @private
 */
const NANPPhoneDelimiters = {
  name: 'NANPPhoneDelimiters',
  0: '(',
  4: ')',
  5: ' ',
  9: '-'
};

/**
 * @const
 * @private
 */
const NANPPhoneDelimitersWithOne = {
  name: 'NANPPhoneDelimitersWithOne',
  1:  ' ',
  2:  '(',
  6:  ')',
  7:  ' ',
  11: '-'
};

/**
 * @const
 * @private
 */
const E164PhoneDelimitersWithOneDigit = {
  name: 'E164PhoneDelimitersWithOneDigit',
  2:  ' ',
  3:  '(',
  7:  ')',
  8:  ' ',
  12: '-'
};

/**
 * @const
 * @private
 */
const E164PhoneDelimitersWithTwoDigit = {
  name: 'E164PhoneDelimitersWithTwoDigit',
  3:  ' ',
  4:  '(',
  8:  ')',
  9:  ' ',
  13: '-'
};

/**
 * @const
 * @private
 */
const E164PhoneDelimitersWithThreeDigit = {
  name: 'E164PhoneDelimitersWithThreeDigit',
  4:  ' ',
  5:  '(',
  9:  ')',
  10:  ' ',
  14: '-'
};

/**
 * This should match any characters in the maps above.
 *
 * @const
 * @private
 */
const DELIMITER_PATTERN = /[-\(\) ]/g;

/**
 * @const
 * @private
 */
const DEFAULT_COUNTRY_CODE = {
  "E164": "1",
  "country": ["American Samoa", "Anguilla", "Antigua and Barbuda", "Bahamas", "Barbados", "Bermuda", "British Virgin Islands", "Canada", "Cayman Islands", "Dominica", "Dominican Republic", "Grenada", "Guam", "Jamaica", "Montserrat", "Northern Mariana Islands", "Puerto Rico", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Vincent and the Grenadines", "Sint Maarten", "Trinidad and Tobago", "Turks and Caicos Islands", "U.S. Virgin Islands", "United States"]
};

/**
 * This is an internal store for the current country
 *
 * @private
 */
let currentCountryCode = DEFAULT_COUNTRY_CODE;

/**
 * @extends DelimitedTextFormatter
 */
class PhoneFormatter extends DelimitedTextFormatter {
  /**
   * @throws {Error} if anything is passed in
   * @param {Array} args
   */
  constructor(...args) {
    super();

    if (args.length !== 0) {
      throw new Error('were you trying to set a delimiter ('+args[0]+')?');
    }
  }

  /**
   * @param {string} chr
   * @returns {boolean}
   */
  isDelimiter(chr) {
    const map = this.delimiterMap;
    for (let index in map) {
      if (map.hasOwnProperty(index)) {
        if (map[index] === chr) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * @param {number} index
   * @returns {?string}
   */
  delimiterAt(index) {
    return this.delimiterMap[index];
  }

  /**
   * @param {number} index
   * @returns {boolean}
   */
  hasDelimiterAtIndex(index) {
    const delimiter = this.delimiterAt(index);
    return delimiter !== undefined && delimiter !== null;
  }

  /**
   * Will call parse on the formatter.
   *
   * @param {string} text
   * @param {function(string)} error
   * @returns {string} returns value with delimiters removed
   */
  parse(text, error) {
    if (!error) { error = function(){}; }
    const digits = this.digitsWithoutCountryCode(text);
    // Source: http://en.wikipedia.org/wiki/North_American_Numbering_Plan
    //
    // Area Code
    if (text.length < 10) {
      error('phone-formatter.number-too-short');
    }
    if (digits[0] === '0') {
      error('phone-formatter.area-code-zero');
    }
    if (digits[0] === '1') {
      error('phone-formatter.area-code-one');
    }
    if (digits[1] === '9') {
      error('phone-formatter.area-code-n9n');
    }
    // Central Office Code
    if (digits[3] === '1') {
      error('phone-formatter.central-office-one');
    }
    if (digits.slice(4, 6) === '11') {
      error('phone-formatter.central-office-n11');
    }
    return super.parse(text, error);
  }

  /**
   * @param {string} value
   * @returns {string}
   */
  format(value) {
    this.guessFormatFromText(value);
    return super.format(this.removeDelimiterMapChars(value));
  }

  /**
   * Determines whether the given change should be allowed and, if so, whether
   * it should be altered.
   *
   * @param {TextFieldStateChange} change
   * @param {function(string)} error
   * @returns {boolean}
   */
  isChangeValid(change, error) {
    this.guessFormatFromText(change.proposed.text);

    if (change.inserted.text.length > 1) {
      // handle pastes
      const text = change.current.text;
      const selectedRange = change.current.selectedRange;
      const toInsert = change.inserted.text;

      // Replace the selection with the new text, remove non-digits, then format.
      const formatted = this.format((
        text.slice(0, selectedRange.start) +
        toInsert +
        text.slice(selectedRange.start+selectedRange.length)
      ).replace(/[^\d]/g, ''));

      change.proposed = {
        text: formatted,
        selectedRange: {
          start: formatted.length - (text.length - (selectedRange.start + selectedRange.length)),
          length: 0
        }
      };

      return super.isChangeValid(change, error);
    }

    if (/^\d*$/.test(change.inserted.text) || change.proposed.text.indexOf('+') === 0) {
      let formatName = this.delimiterMap.name;

      // First guess at the localized format
      if (currentCountryCode.localizedFormat) {
        this.delimiterMap = currentCountryCode.localizedFormat;
        this.maximumLength = currentCountryCode.localizedFormat.maximumLength;
        formatName = `localized-${currentCountryCode.E164}`;
      }

      // We need to store the change and current format guess so that if the isChangeValid
      // call to super changes the proposed text such that the format we thought is no longer
      // valid. If that does happen we actually just rerun it through with the correct format
      const originalProposed = change.proposed.text;
      const _isChangeValid = super.isChangeValid(change, error);

      this.guessFormatFromText(change.proposed.text);

      // Make sure if the localizedFormat changed, respect that
      if (currentCountryCode.localizedFormat) {
        this.delimiterMap = currentCountryCode.localizedFormat;
        this.maximumLength = currentCountryCode.localizedFormat.maximumLength;
        this.delimiterMap.name = `localized-${currentCountryCode.E164}`;
      }

      if (formatName === this.delimiterMap.name) {
        return _isChangeValid;
      } else {
        const originalChange = change;
        originalChange.proposed.text = originalProposed;
        return super.isChangeValid(originalChange, error);
      }
    } else {
      return false;
    }
  }

  /**
   * Re-configures this formatter to use the delimiters appropriate
   * for the given text.
   *
   * @param {string} text A potentially formatted string containing a phone number.
   * @private
   */
  guessFormatFromText(text) {
    currentCountryCode = DEFAULT_COUNTRY_CODE;
    if (text && text[0] === '+') {
      if (text.length > 1) {
        const isValidCountryCode = countryCode => {
          const matchingCodes = COUNTRY_CODES.filter( country => country.E164 === countryCode );

          return matchingCodes.length > 0;
        };

        const rawText = this.removeDelimiterMapChars(text);
        if (currentCountryCode = isValidCountryCode(rawText[1])) {
          this.delimiterMap = E164PhoneDelimitersWithOneDigit;
          this.maximumLength = 1 + 1 + 10 + 5;
        } else if (text.length > 2 && (currentCountryCode = isValidCountryCode(rawText.slice(1,3)))) {
          this.delimiterMap = E164PhoneDelimitersWithTwoDigit;
          this.maximumLength = 1 + 2 + 10 + 5;
        } else {
          currentCountryCode = isValidCountryCode(rawText.slice(1,4)) || DEFAULT_COUNTRY_CODE;
          this.delimiterMap = E164PhoneDelimitersWithThreeDigit;
          this.maximumLength = 1 + 3 + 10 + 5;
        }
      } else {

        this.delimiterMap = E164PhoneDelimitersWithThreeDigit;
        this.maximumLength = 1 + 3 + 10 + 5;
      }

    } else if (text && text[0] === '1') {
      this.delimiterMap = NANPPhoneDelimitersWithOne;
      this.maximumLength = 1 + 10 + 5;
    } else if (text && text[0] === ' ') {
      this.delimiterMap = NANPPhoneDelimiters;
      this.maximumLength = 10 + 5;
    } else {
      this.delimiterMap = NANPPhoneDelimiters;
      this.maximumLength = 10 + 4;
    }
  }

  /**
   * Gives back just the phone number digits as a string without the
   * country code. Future-proofing internationalization where the country code
   * isn't just +1.
   *
   * @param {string} text
   * @private
   */
  digitsWithoutCountryCode(text) {
    let digits = (text || '').replace(/[^\d]/g, '');
    const extraDigits = digits.length - 10;
    if (extraDigits > 0) {
      digits = digits.substr(extraDigits);
    }
    return digits;
  }

  /**
   * Removes characters from the phone number that will be added
   * by the formatter.
   *
   * @param {string} text
   * @private
   */
  removeDelimiterMapChars(text) {
    return (text || '').replace(DELIMITER_PATTERN, '');
  }
}

const COUNTRY_CODES = [
  {
    "E164": "93",
    "country": "Afghanistan"
  },
  {
    "E164": "355",
    "country": "Albania"
  },
  {
    "E164": "213",
    "country": "Algeria"
  },
  {
    "E164": "1",
    "country": ["American Samoa", "Anguilla", "Antigua and Barbuda", "Bahamas", "Barbados", "Bermuda", "British Virgin Islands", "Canada", "Cayman Islands", "Dominica", "Dominican Republic", "Grenada", "Guam", "Jamaica", "Montserrat", "Northern Mariana Islands", "Puerto Rico", "Saint Kitts and Nevis", "Saint Lucia", "Saint Martin", "Saint Vincent and the Grenadines", "Sint Maarten", "Trinidad and Tobago", "Turks and Caicos Islands", "U.S. Virgin Islands", "United States"]
  },
  {
    "E164": "376",
    "country": "Andorra"
  },
  {
    "E164": "244",
    "country": "Angola"
  },
  {
    "E164": "672",
    "country": "Antarctica"
  },
  {
    "E164": "54",
    "country": "Argentina"
  },
  {
    "E164": "374",
    "country": "Armenia"
  },
  {
    "E164": "297",
    "country": "Aruba"
  },
  {
    "E164": "43",
    "country": "Austria"
  },
  {
    "E164": "994",
    "country": "Azerbaijan"
  },
  {
    "E164": "973",
    "country": "Bahrain"
  },
  {
    "E164": "880",
    "country": "Bangladesh"
  },
  {
    "E164": "375",
    "country": "Belarus"
  },
  {
    "E164": "32",
    "country": "Belgium"
  },
  {
    "E164": "501",
    "country": "Belize"
  },
  {
    "E164": "229",
    "country": "Benin"
  },
  {
    "E164": "975",
    "country": "Bhutan"
  },
  {
    "E164": "591",
    "country": "Bolivia"
  },
  {
    "E164": "387",
    "country": "Bosnia and Herzegovina"
  },
  {
    "E164": "267",
    "country": "Botswana"
  },
  {
    "E164": "55",
    "country": "Brazil"
  },
  {
    "E164": "246",
    "country": "British Indian Ocean Territory"
  },
  {
    "E164": "673",
    "country": "Brunei"
  },
  {
    "E164": "359",
    "country": "Bulgaria"
  },
  {
    "E164": "226",
    "country": "Burkina Faso"
  },
  {
    "E164": "257",
    "country": "Burundi"
  },
  {
    "E164": "855",
    "country": "Cambodia"
  },
  {
    "E164": "237",
    "country": "Cameroon"
  },
  {
    "E164": "238",
    "country": "Cape Verde"
  },
  {
    "E164": "236",
    "country": "Central African Republic"
  },
  {
    "E164": "235",
    "country": "Chad"
  },
  {
    "E164": "56",
    "country": "Chile"
  },
  {
    "E164": "86",
    "country": "China"
  },
  {
    "E164": "61",
    "country": ["Australia", "Christmas Island", "Cocos Islands"]
  },
  {
    "E164": "57",
    "country": "Colombia"
  },
  {
    "E164": "269",
    "country": "Comoros"
  },
  {
    "E164": "682",
    "country": "Cook Islands"
  },
  {
    "E164": "506",
    "country": "Costa Rica"
  },
  {
    "E164": "385",
    "country": "Croatia"
  },
  {
    "E164": "53",
    "country": "Cuba"
  },
  {
    "E164": "599",
    "country": ["Curacao", "Netherlands Antilles"]
  },
  {
    "E164": "357",
    "country": "Cyprus"
  },
  {
    "E164": "420",
    "country": "Czech Republic"
  },
  {
    "E164": "243",
    "country": "Democratic Republic of the Congo"
  },
  {
    "E164": "45",
    "country": "Denmark"
  },
  {
    "E164": "253",
    "country": "Djibouti"
  },
  {
    "E164": "670",
    "country": "East Timor"
  },
  {
    "E164": "593",
    "country": "Ecuador"
  },
  {
    "E164": "20",
    "country": "Egypt"
  },
  {
    "E164": "503",
    "country": "El Salvador"
  },
  {
    "E164": "240",
    "country": "Equatorial Guinea"
  },
  {
    "E164": "291",
    "country": "Eritrea"
  },
  {
    "E164": "372",
    "country": "Estonia"
  },
  {
    "E164": "251",
    "country": "Ethiopia"
  },
  {
    "E164": "500",
    "country": "Falkland Islands"
  },
  {
    "E164": "298",
    "country": "Faroe Islands"
  },
  {
    "E164": "679",
    "country": "Fiji"
  },
  {
    "E164": "358",
    "country": "Finland"
  },
  {
    "E164": "33",
    "country": "France"
  },
  {
    "E164": "689",
    "country": "French Polynesia"
  },
  {
    "E164": "241",
    "country": "Gabon"
  },
  {
    "E164": "220",
    "country": "Gambia"
  },
  {
    "E164": "995",
    "country": "Georgia"
  },
  {
    "E164": "49",
    "country": "Germany"
  },
  {
    "E164": "233",
    "country": "Ghana"
  },
  {
    "E164": "350",
    "country": "Gibraltar"
  },
  {
    "E164": "30",
    "country": "Greece"
  },
  {
    "E164": "299",
    "country": "Greenland"
  },
  {
    "E164": "502",
    "country": "Guatemala"
  },
  {
    "E164": "44",
    "country": ["Guernsey", "Isle of Man", "Jersey", "United Kingdom"]
  },
  {
    "E164": "224",
    "country": "Guinea"
  },
  {
    "E164": "245",
    "country": "Guinea-Bissau"
  },
  {
    "E164": "592",
    "country": "Guyana"
  },
  {
    "E164": "509",
    "country": "Haiti"
  },
  {
    "E164": "504",
    "country": "Honduras"
  },
  {
    "E164": "852",
    "country": "Hong Kong"
  },
  {
    "E164": "36",
    "country": "Hungary"
  },
  {
    "E164": "354",
    "country": "Iceland"
  },
  {
    "E164": "91",
    "country": "India"
  },
  {
    "E164": "62",
    "country": "Indonesia"
  },
  {
    "E164": "98",
    "country": "Iran"
  },
  {
    "E164": "964",
    "country": "Iraq"
  },
  {
    "E164": "353",
    "country": "Ireland"
  },
  {
    "E164": "972",
    "country": "Israel"
  },
  {
    "E164": "39",
    "country": ["Italy", "Vatican"]
  },
  {
    "E164": "225",
    "country": "Ivory Coast"
  },
  {
    "E164": "81",
    "country": "Japan"
  },
  {
    "E164": "962",
    "country": "Jordan"
  },
  {
    "E164": "7",
    "country": ["Kazakhstan", "Russia"],
    "localizedFormat": {
      "maximumLength": 1 + 1 + 10 + 6,
      2:  ' ',
      3:  '(',
      7:  ')',
      8:  ' ',
      12: '-',
      15: '-'
    }
  },
  {
    "E164": "254",
    "country": "Kenya"
  },
  {
    "E164": "686",
    "country": "Kiribati"
  },
  {
    "E164": "383",
    "country": "Kosovo"
  },
  {
    "E164": "965",
    "country": "Kuwait"
  },
  {
    "E164": "996",
    "country": "Kyrgyzstan"
  },
  {
    "E164": "856",
    "country": "Laos"
  },
  {
    "E164": "371",
    "country": "Latvia"
  },
  {
    "E164": "961",
    "country": "Lebanon"
  },
  {
    "E164": "266",
    "country": "Lesotho"
  },
  {
    "E164": "231",
    "country": "Liberia"
  },
  {
    "E164": "218",
    "country": "Libya"
  },
  {
    "E164": "423",
    "country": "Liechtenstein"
  },
  {
    "E164": "370",
    "country": "Lithuania"
  },
  {
    "E164": "352",
    "country": "Luxembourg"
  },
  {
    "E164": "853",
    "country": "Macao"
  },
  {
    "E164": "389",
    "country": "Macedonia"
  },
  {
    "E164": "261",
    "country": "Madagascar"
  },
  {
    "E164": "265",
    "country": "Malawi"
  },
  {
    "E164": "60",
    "country": "Malaysia"
  },
  {
    "E164": "960",
    "country": "Maldives"
  },
  {
    "E164": "223",
    "country": "Mali"
  },
  {
    "E164": "356",
    "country": "Malta"
  },
  {
    "E164": "692",
    "country": "Marshall Islands"
  },
  {
    "E164": "222",
    "country": "Mauritania"
  },
  {
    "E164": "230",
    "country": "Mauritius"
  },
  {
    "E164": "262",
    "country": ["Mayotte", "Reunion"]
  },
  {
    "E164": "52",
    "country": "Mexico"
  },
  {
    "E164": "691",
    "country": "Micronesia"
  },
  {
    "E164": "373",
    "country": "Moldova"
  },
  {
    "E164": "377",
    "country": "Monaco"
  },
  {
    "E164": "976",
    "country": "Mongolia"
  },
  {
    "E164": "382",
    "country": "Montenegro"
  },
  {
    "E164": "212",
    "country": ["Morocco", "Western Sahara"]
  },
  {
    "E164": "258",
    "country": "Mozambique"
  },
  {
    "E164": "95",
    "country": "Myanmar"
  },
  {
    "E164": "264",
    "country": "Namibia"
  },
  {
    "E164": "674",
    "country": "Nauru"
  },
  {
    "E164": "977",
    "country": "Nepal"
  },
  {
    "E164": "31",
    "country": "Netherlands"
  },
  {
    "E164": "687",
    "country": "New Caledonia"
  },
  {
    "E164": "64",
    "country": "New Zealand"
  },
  {
    "E164": "64",
    "country": "Pitcairn"
  },
  {
    "E164": "505",
    "country": "Nicaragua"
  },
  {
    "E164": "227",
    "country": "Niger"
  },
  {
    "E164": "234",
    "country": "Nigeria"
  },
  {
    "E164": "683",
    "country": "Niue"
  },
  {
    "E164": "850",
    "country": "North Korea"
  },
  {
    "E164": "47",
    "country": ["Norway", "Svalbard and Jan Mayen"]
  },
  {
    "E164": "968",
    "country": "Oman"
  },
  {
    "E164": "92",
    "country": "Pakistan"
  },
  {
    "E164": "680",
    "country": "Palau"
  },
  {
    "E164": "970",
    "country": "Palestine"
  },
  {
    "E164": "507",
    "country": "Panama"
  },
  {
    "E164": "675",
    "country": "Papua New Guinea"
  },
  {
    "E164": "595",
    "country": "Paraguay"
  },
  {
    "E164": "51",
    "country": "Peru"
  },
  {
    "E164": "63",
    "country": "Philippines"
  },
  {
    "E164": "48",
    "country": "Poland"
  },
  {
    "E164": "351",
    "country": "Portugal"
  },
  {
    "E164": "974",
    "country": "Qatar"
  },
  {
    "E164": "242",
    "country": "Republic of the Congo"
  },
  {
    "E164": "40",
    "country": "Romania"
  },
  {
    "E164": "250",
    "country": "Rwanda"
  },
  {
    "E164": "590",
    "country": "Saint Barthelemy"
  },
  {
    "E164": "290",
    "country": "Saint Helena"
  },
  {
    "E164": "508",
    "country": "Saint Pierre and Miquelon"
  },
  {
    "E164": "685",
    "country": "Samoa"
  },
  {
    "E164": "378",
    "country": "San Marino"
  },
  {
    "E164": "239",
    "country": "Sao Tome and Principe"
  },
  {
    "E164": "966",
    "country": "Saudi Arabia"
  },
  {
    "E164": "221",
    "country": "Senegal"
  },
  {
    "E164": "381",
    "country": "Serbia"
  },
  {
    "E164": "248",
    "country": "Seychelles"
  },
  {
    "E164": "232",
    "country": "Sierra Leone"
  },
  {
    "E164": "65",
    "country": "Singapore"
  },
  {
    "E164": "421",
    "country": "Slovakia"
  },
  {
    "E164": "386",
    "country": "Slovenia"
  },
  {
    "E164": "677",
    "country": "Solomon Islands"
  },
  {
    "E164": "252",
    "country": "Somalia"
  },
  {
    "E164": "27",
    "country": "South Africa"
  },
  {
    "E164": "82",
    "country": "South Korea"
  },
  {
    "E164": "211",
    "country": "South Sudan"
  },
  {
    "E164": "34",
    "country": "Spain"
  },
  {
    "E164": "94",
    "country": "Sri Lanka"
  },
  {
    "E164": "249",
    "country": "Sudan"
  },
  {
    "E164": "597",
    "country": "Suriname"
  },
  {
    "E164": "268",
    "country": "Swaziland"
  },
  {
    "E164": "46",
    "country": "Sweden"
  },
  {
    "E164": "41",
    "country": "Switzerland"
  },
  {
    "E164": "963",
    "country": "Syria"
  },
  {
    "E164": "886",
    "country": "Taiwan"
  },
  {
    "E164": "992",
    "country": "Tajikistan"
  },
  {
    "E164": "255",
    "country": "Tanzania"
  },
  {
    "E164": "66",
    "country": "Thailand"
  },
  {
    "E164": "228",
    "country": "Togo"
  },
  {
    "E164": "690",
    "country": "Tokelau"
  },
  {
    "E164": "676",
    "country": "Tonga"
  },
  {
    "E164": "216",
    "country": "Tunisia"
  },
  {
    "E164": "90",
    "country": "Turkey"
  },
  {
    "E164": "993",
    "country": "Turkmenistan"
  },
  {
    "E164": "688",
    "country": "Tuvalu"
  },
  {
    "E164": "256",
    "country": "Uganda"
  },
  {
    "E164": "380",
    "country": "Ukraine"
  },
  {
    "E164": "971",
    "country": "United Arab Emirates"
  },
  {
    "E164": "598",
    "country": "Uruguay"
  },
  {
    "E164": "998",
    "country": "Uzbekistan"
  },
  {
    "E164": "678",
    "country": "Vanuatu"
  },
  {
    "E164": "58",
    "country": "Venezuela"
  },
  {
    "E164": "84",
    "country": "Vietnam"
  },
  {
    "E164": "681",
    "country": "Wallis and Futuna"
  },
  {
    "E164": "967",
    "country": "Yemen"
  },
  {
    "E164": "260",
    "country": "Zambia"
  },
  {
    "E164": "263",
    "country": "Zimbabwe"
  }
];
export default PhoneFormatter;
