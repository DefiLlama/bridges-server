export const isValidPriceId = (id?: string) => {
  if (!id) return false;
  if (id.includes("\\") || id.includes("/") || id.includes(" ")) return false;
  const parts = id.split(":");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return false;
  const identifier = parts[1].toLowerCase();
  return identifier !== "null" && identifier !== "undefined";
};
