/**
 * Encrypts plaintext using AES-GCM with key derived from password.
 * Output format: salt(16) + nonce(12) + ciphertext + tag(16)
 */
export function encryptGcmBin(plaintext: string | Uint8Array, password: string | Uint8Array): Promise<Uint8Array>;

/**
 * Decrypts binary data produced by encryptGcmBin().
 */
export function decryptGcmBin(data: string | Uint8Array, password: string | Uint8Array): Promise<Uint8Array>;

/**
 * Encrypts data using AES-GCM and returns Base64 string.
 */
export function encryptGcm(data: string | Uint8Array, password: string | Uint8Array): Promise<string>;

/**
 * Decrypts Base64 encoded AES-GCM data.
 */
export function decryptGcm(data: string, password: string | Uint8Array): Promise<Uint8Array>;
