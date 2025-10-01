
export const generateBookingCode = (subjectPrefix: string): string => {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${subjectPrefix.toUpperCase()}-${randomSuffix}`;
};
