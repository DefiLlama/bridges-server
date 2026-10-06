export const parseBridgeId = (value?: string): number | undefined => {
  if (!value || !/^\d+$/.test(value)) return undefined;

  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};
