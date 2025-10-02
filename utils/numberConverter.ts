export const toEasternArabicNumerals = (str: string | number): string => {
  const easternArabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(str).replace(/[0-9]/g, (digit) => easternArabicNumerals[parseInt(digit)]);
};
