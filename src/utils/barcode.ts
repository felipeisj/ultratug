export function generateShortBarcode() {
  // Generate a random 6-character alphanumeric code (uppercase)
  // Or a 6-digit numeric code if preferred. Alphanumeric gives more combinations.
  // Using 36 bits of randomness and taking 6 chars.
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}
