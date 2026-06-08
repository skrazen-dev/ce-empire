/**
 * AES-256-GCM encryption/decryption for sensitive account fields
 * (virtualCardNumber, cardCVV, accountPassword)
 */
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // 96-bit IV for GCM
const TAG_LENGTH = 16;

function getKey(): Buffer {
  const secret = process.env.JWT_SECRET ?? "ce-empire-default-secret-key-32ch";
  // Derive a 32-byte key from the secret (pad/truncate)
  const key = Buffer.alloc(32);
  Buffer.from(secret).copy(key);
  return key;
}

/**
 * Encrypt a plaintext string → base64 encoded "iv:tag:ciphertext"
 */
export function encrypt(plaintext: string): string {
  if (!plaintext) return plaintext;
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  // Format: base64(iv) + ":" + base64(tag) + ":" + base64(ciphertext)
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

/**
 * Decrypt a "iv:tag:ciphertext" base64 string → plaintext
 * Returns original value if not in encrypted format (backward compat)
 */
export function decrypt(encryptedValue: string): string {
  if (!encryptedValue) return encryptedValue;

  const parts = encryptedValue.split(":");
  if (parts.length !== 3) return encryptedValue; // not encrypted, return as-is

  try {
    const [ivB64, tagB64, dataB64] = parts;
    const key = getKey();
    const iv = Buffer.from(ivB64, "base64");
    const tag = Buffer.from(tagB64, "base64");
    const data = Buffer.from(dataB64, "base64");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    return decipher.update(data).toString("utf8") + decipher.final("utf8");
  } catch {
    // Decryption failed - return original (may be legacy plaintext)
    return encryptedValue;
  }
}

/**
 * Encrypt sensitive fields in an account update payload
 */
export function encryptSensitiveFields(data: {
  virtualCardNumber?: string | null;
  cardCvv?: string | null;
  accountPassword?: string | null;
  [key: string]: unknown;
}): typeof data {
  const result = { ...data };
  if (result.virtualCardNumber) result.virtualCardNumber = encrypt(result.virtualCardNumber);
  if (result.cardCvv) result.cardCvv = encrypt(result.cardCvv);
  if (result.accountPassword) result.accountPassword = encrypt(result.accountPassword);
  return result;
}

/**
 * Decrypt sensitive fields in an account row from DB
 */
export function decryptSensitiveFields(account: {
  virtualCardNumber?: string | null;
  cardCVV?: string | null;
  accountPassword?: string | null;
  [key: string]: unknown;
}): typeof account {
  const result = { ...account };
  if (result.virtualCardNumber) result.virtualCardNumber = decrypt(result.virtualCardNumber);
  if (result.cardCVV) result.cardCVV = decrypt(result.cardCVV);
  if (result.accountPassword) result.accountPassword = decrypt(result.accountPassword);
  return result;
}
