/**
 * Generates a login code for child users based on their name
 * Format: First 3 letters of name (uppercase) + 6 random alphanumeric characters
 * E.g., "EMM2K9J4X1" for a child named "Emma"
 */
export function generateChildLoginCode(childName: string): string {
  // Extract first 3 letters of child's name (uppercase)
  const namePrefix = childName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z]/g, ""); // Remove non-alphabetic characters

  // If name doesn't have enough letters, pad with random letters
  const prefix = namePrefix.padEnd(3, "X");

  // Generate 6 random alphanumeric characters for uniqueness
  const alphabet = process.env.CHILD_LOGIN_CODE_ALPHABET || "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let randomSuffix = "";
  for (let i = 0; i < 6; i++) {
    randomSuffix += alphabet.charAt(Math.floor(Math.random() * alphabet.length));
  }

  return `${prefix}${randomSuffix}`;
}

/**
 * Generates a unique random ID for child avatar selection
 */
export function generateRandomId(prefix: string = ""): string {
  const id = Math.random().toString(36).substring(2, 15);
  return prefix ? `${prefix}-${id}` : id;
}
