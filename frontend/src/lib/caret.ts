export function getDigitsBeforeCaret(text: string, caretPos: number) {
  return (text.slice(0, caretPos).match(/\d/g) ?? []).length;
}

export function caretFromDigitsIndex(formatted: string, digitIndex: number) {
  if (digitIndex <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) {
      seen++;
      if (seen === digitIndex) {
        return i + 1;
      }
    }
  }
  return formatted.length;
}
