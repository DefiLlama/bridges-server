const SELECTOR_LENGTH = 10;

export const matchesFunctionSignature = (inputData: unknown, signatures: Array<string>): boolean => {
  const selector = typeof inputData === "string" ? inputData.slice(0, SELECTOR_LENGTH) : "";
  if (!selector) return false;
  return signatures.some((candidate) => candidate.length > 2 && selector.slice(0, candidate.length) === candidate);
};
