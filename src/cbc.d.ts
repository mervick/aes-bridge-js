/**
 * Encrypts plaintext using AES-CBC + HMAC with derived key from password.
 * Returns binary format: salt (16) + IV (16) + ciphertext + HMAC (32).
 */
export function encryptCbcBin(plaintext: string | Uint8Array, password: string | Uint8Array): Promise<Uint8Array>;

/**
 * Decrypts binary data encrypted with `encryptCbcBin`.
 */
export function decryptCbcBin(data: string | Uint8Array, password: string | Uint8Array): Promise<Uint8Array>;

/**
 * Encrypts data and returns result as base64 string.
 */
export function encryptCbc(data: string | Uint8Array, password: string | Uint8Array): Promise<string>;

/**
 * Decrypts base64-encoded AES-CBC + HMAC data.
 */
export function decryptCbc(data: string, password: string | Uint8Array): Promise<Uint8Array>;
