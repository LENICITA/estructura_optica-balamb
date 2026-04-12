export async function hashSHA256(message) {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

export async function verifyPassword(password, hash) {
  const passwordHash = await hashSHA256(password);
  return passwordHash === hash;
}

export function generateRandomPassword() {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz";
  const numbers = "23456789";
  let password = "";
  for (let i = 0; i < 4; i++) password += letters.charAt(Math.floor(Math.random() * letters.length));
  for (let i = 0; i < 4; i++) password += numbers.charAt(Math.floor(Math.random() * numbers.length));
  return password;
}