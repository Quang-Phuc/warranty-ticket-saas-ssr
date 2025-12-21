export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s/g, '');
  return /^(\+?84|0)(\d{9,10})$/.test(cleaned);
}
