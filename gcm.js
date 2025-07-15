import { toBytes, generateRandom, base64Encode, base64Decode } from './common.js';

/**
 * Derives a 256-bit key from password and salt using PBKDF2-HMAC-SHA256.
 *
 * @param {string|Uint8Array} password - The password
 * @param {Uint8Array} salt - 16-byte salt
 * @returns {Promise<CryptoKey>}
 */
async function deriveKey(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toBytes(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
    // ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts plaintext using AES-GCM with key derived from password.
 * Output format: salt(16) + nonce(12) + ciphertext + tag(16)
 *
 * @param {string|Uint8Array} plaintext - Data to encrypt
 * @param {string|Uint8Array} password - Password
 * @returns {Promise<Uint8Array>}
 */
export async function encryptGcmBin(plaintext, password) {
  plaintext = toBytes(plaintext);
  password = toBytes(password);
  const salt = generateRandom(16);
  const nonce = generateRandom(12);
  const key = await deriveKey(password, salt);

  const encrypted = new Uint8Array(await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128
    },
    key,
    plaintext
  ));

  const result = new Uint8Array(salt.length + nonce.length + encrypted.length);
  result.set(salt);
  result.set(nonce, salt.length);
  result.set(encrypted, salt.length + nonce.length);
  return result;
}

/**
 * Decrypts binary data produced by encryptGcmBin().
 *
 * @param {string|Uint8Array} data - Encrypted binary data
 * @param {string|Uint8Array} password - Password
 * @returns {Promise<Uint8Array>}
 */
export async function decryptGcmBin(data, password) {
  data = toBytes(data);
  password = toBytes(password);

  const salt = data.slice(0, 16);
  const nonce = data.slice(16, 28);
  const ciphertextWithTag = data.slice(28);

  const key = await deriveKey(password, salt);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: nonce,
      tagLength: 128
    },
    key,
    ciphertextWithTag
  );

  return new Uint8Array(decrypted);
}

/**
 * Encrypts data using AES-GCM and returns Base64 string.
 *
 * @param {string|Uint8Array} data - Data to encrypt
 * @param {string|Uint8Array} password - Password
 * @returns {Promise<string>}
 */
export async function encryptGcm(data, password) {
  const result = await encryptGcmBin(data, password);
  return base64Encode(result);
}

/**
 * Decrypts Base64 encoded AES-GCM data.
 *
 * @param {string} data - Base64-encoded encrypted string
 * @param {string|Uint8Array} password - Password
 * @returns {Promise<Uint8Array>}
 */
export async function decryptGcm(data, password) {
  const raw = base64Decode(toBytes(data));
  return decryptGcmBin(raw, password);
}
