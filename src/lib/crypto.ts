import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const SALT_LENGTH = 32;
const TAG_LENGTH = 16;
const VERSION = "v1";

function getKey(): Buffer {
  const secretKey = process.env.INSTAGRAM_SECRET_KEY;
  if (!secretKey) {
    throw new Error("INSTAGRAM_SECRET_KEY environment variable is not set");
  }
  const salt = Buffer.alloc(SALT_LENGTH, secretKey.slice(0, SALT_LENGTH));
  return scryptSync(secretKey, salt, 32);
}

export function encryptSecret(plain: string): string {
  if (!plain) return "";
  
  const key = getKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plain, "utf8", "base64");
  encrypted += cipher.final("base64");

  const tag = cipher.getAuthTag();

  const combined = Buffer.concat([
    iv,
    tag,
    Buffer.from(encrypted, "base64")
  ]);

  return `enc:${VERSION}:${combined.toString("base64")}`;
}

export function decryptSecret(stored: string): string {
  if (!stored) return "";

  if (!stored.startsWith(`enc:${VERSION}:`)) {
    return stored;
  }

  const base64Data = stored.slice(`enc:${VERSION}:`.length);
  const combined = Buffer.from(base64Data, "base64");

  const iv = combined.subarray(0, IV_LENGTH);
  const tag = combined.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.subarray(IV_LENGTH + TAG_LENGTH);

  const key = getKey();
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

export function isEncrypted(value: string): boolean {
  return value?.startsWith(`enc:${VERSION}:`) ?? false;
}
