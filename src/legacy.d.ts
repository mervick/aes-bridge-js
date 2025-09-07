/**
 * Encrypts plaintext using AES-256-CBC with OpenSSL-compatible format.
 * Output: Base64 encoded "Salted__" + salt(8) + ciphertext
 */
export function encryptLegacy(raw: string | Uint8Array, passphrase: string | Uint8Array): Promise<string>;

/**
 * Decrypts Base64-encoded AES-256-CBC data with OpenSSL-compatible format.
 */
export function decryptLegacy(enc: string, passphrase: string | Uint8Array): Promise<Uint8Array>;
