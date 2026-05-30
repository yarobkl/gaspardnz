export const normalizeWhatsappNumber = (number) => {
  if (!number) return "";
  return number.replace(/^[\+\s\-\(\)]/g, "").replace(/[\s\-\(\)]/g, "");
};

export const getWhatsappUrl = (number, text = "") => {
  const normalized = normalizeWhatsappNumber(number);
  if (!normalized) return "";
  const encodedText = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${normalized}${encodedText}`;
};
