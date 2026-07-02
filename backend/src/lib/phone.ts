/** Normalize phone to digits only (India default: prepend 91 when 10 digits). */
export function normalizePhoneE164(phone: string | null | undefined): string | null {
  if (!phone?.trim()) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `91${digits}`;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits;
}

export function toWhatsAppJid(e164: string): string {
  return `${e164.replace(/\D/g, "")}@s.whatsapp.net`;
}
