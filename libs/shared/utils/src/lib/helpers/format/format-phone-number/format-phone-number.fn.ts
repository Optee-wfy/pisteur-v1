/**
 * Format a french phone number by adding spaces every two digits.
 * Note: This function is optimized for French numbers (+33 or 0x). Non-French international numbers will be returned cleaned without specific formatting.
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) {
    return "";
  }

  // Remove everything except digits and +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Replace +33 with 0
  if (cleaned.startsWith("+33")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("+")) {
    // For non-French international numbers, keep as-is (just cleaned)
    return cleaned;
  }

  // Add a space every 2 digits
  const spaced = cleaned.match(/.{1,2}/g)?.join(" ") ?? cleaned;

  return spaced;
}
