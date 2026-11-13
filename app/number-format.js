export const numberFormatter = new Intl.NumberFormat("en-US", { useGrouping: false });
export const dateFormatter = new Intl.DateTimeFormat("ar-EG-u-nu-latn", { dateStyle: "medium" });

export function toWesternDigits(value) {
  return String(value)
    .replace(/[٠-٩۰-۹]/g, (digit) => {
      const codePoint = digit.codePointAt(0);
      return String(codePoint >= 0x06f0 ? codePoint - 0x06f0 : codePoint - 0x0660);
    })
    .replace(/\u066c/g, "")
    .replace(/\u066b/g, ".")
    .replace(/٪/g, "%");
}

export function normalizeDisplayData(value) {
  if (typeof value === "string") return toWesternDigits(value);
  if (Array.isArray(value)) return value.map(normalizeDisplayData);
  if (value && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, normalizeDisplayData(item)]),
    );
  }
  return value;
}
