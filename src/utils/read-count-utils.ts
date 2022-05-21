type KhmerToArabicMap = {
  [key: string]: number;
};
type ArabicToKhmerMap = {
  [key: number]: string;
};

const numberMapKhmerToArabic: KhmerToArabicMap = {
  "០": 0,
  "១": 1,
  "២": 2,
  "៣": 3,
  "៤": 4,
  "៥": 5,
  "៦": 6,
  "៧": 7,
  "៨": 8,
  "៩": 9,
};
const numberMapArabicToKhmer: ArabicToKhmerMap = {
  0: "០",
  1: "១",
  2: "២",
  3: "៣",
  4: "៤",
  5: "៥",
  6: "៦",
  7: "៧",
  8: "៨",
  9: "៩",
};

/**
 * converts khmer numerals to arabic
 * @param {string} value - i.e. "១២"​, "12", "១២52"
 * @returns string; formatted arabic numerals or the original value
 */
const convertKhmerToArabicNumerals = (value: number | string) => {
  if (typeof value === "number") {
    return value;
  }
  let splited = value.split("");
  for (const [index, val] of splited.entries()) {
    const isArabicNumber = numberMapArabicToKhmer[Number(val)];
    if (isArabicNumber) {
      // skip
      continue;
    }

    const currentNumber = numberMapKhmerToArabic[val]; // khmer numeral
    if (currentNumber || currentNumber === 0) {
      // replace it with the arabic numeral
      splited[index] = currentNumber.toString();
    } else {
      // if the value wasn't found in the number maps, remove the value of splited array.
      delete splited[index];
      //   return value;
    }
  }
  return parseInt(splited.join(""));
};

/**
 * checks if string is a number
 * @param {string} value - i.e. "១២"​, "12", "១២52", "១z២52"
 * @returns boolean
 */
const isNumber = (value: string) =>
  Number(convertKhmerToArabicNumerals(value)).toString() !== "NaN";

module.exports = {
  convertKhmerToArabicNumerals: convertKhmerToArabicNumerals,
  isNumber: isNumber,
};
