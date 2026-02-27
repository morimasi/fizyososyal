import { encryptSecret, decryptSecret, isEncrypted } from "@/lib/crypto";

export interface InstagramCredentials {
  accountId: string;
  token: string;
}

export function encryptInstagramCredentials(accountId: string, token: string): InstagramCredentials {
  return {
    accountId,
    token: encryptSecret(token)
  };
}

export function decryptInstagramCredentials(accountId: string, token: string): InstagramCredentials {
  if (!token) {
    return { accountId, token: "" };
  }
  
  return {
    accountId,
    token: decryptSecret(token)
  };
}

export function shouldReEncrypt(token: string): boolean {
  return !!token && !isEncrypted(token);
}

export function getDecryptedToken(token: string | null | undefined): string {
  if (!token) return "";
  return decryptSecret(token);
}
