import { toBytes, generateRandom, base64Encode, base64Decode } from './common.js';

/**
 * Derives AES and HMAC keys from password and salt using PBKDF2-HMAC-SHA256.
 * 
 * @param {string|Uint8Array} password - Password used for key derivation
 * @param {Uint8Array} salt - 16-byte random salt
 * @returns {Promise<{aesKey: CryptoKey, hmacKey: CryptoKey}>}
 */
async function deriveKeys(password, salt) {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    toBytes(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    64 * 8
  );

  const bytes = new Uint8Array(derived);
  return {
    aesKey: await crypto.subtle.importKey('raw', bytes.slice(0, 32), { name: 'AES-CBC' }, false, ['encrypt', 'decrypt']),
    hmacKey: await crypto.subtle.importKey('raw', bytes.slice(32), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']),
  };
}

/**
 * Encrypts plaintext using AES-CBC + HMAC with derived key from password.
 * Returns binary format: salt (16) + IV (16) + ciphertext + HMAC (32).
 * 
 * @param {string|Uint8Array} plaintext - Data to encrypt
 * @param {string|Uint8Array} password - Password for encryption
 * @returns {Promise<Uint8Array>} - Encrypted binary
 */
export async function encryptCbcBin(plaintext, password) {
  plaintext = toBytes(plaintext);
  password = toBytes(password);
  const salt = generateRandom(16);
  const iv = generateRandom(16);
  const { aesKey, hmacKey } = await deriveKeys(password, salt);

  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv },
    aesKey,
    plaintext
  ));

  const macData = new Uint8Array(iv.length + ciphertext.length);
  macData.set(iv);
  macData.set(ciphertext, iv.length);

  const tag = new Uint8Array(await crypto.subtle.sign('HMAC', hmacKey, macData));

  const result = new Uint8Array(salt.length + iv.length + ciphertext.length + tag.length);
  result.set(salt);
  result.set(iv, salt.length);
  result.set(ciphertext, salt.length + iv.length);
  result.set(tag, salt.length + iv.length + ciphertext.length);

  return result;
}

/**
 * Decrypts binary data encrypted with `encryptCbcBin`.
 * 
 * @param {string|Uint8Array} data - Encrypted binary data
 * @param {string|Uint8Array} password - Password used for encryption
 * @returns {Promise<Uint8Array>} - Decrypted and unpadded data
 */
export async function decryptCbcBin(data, password) {
  data = toBytes(data);
  password = toBytes(password);
  const salt = data.slice(0, 16);
  const iv = data.slice(16, 32);
  const tag = data.slice(-32);
  const ciphertext = data.slice(32, -32);

  const { aesKey, hmacKey } = await deriveKeys(password, salt);

  const macData = new Uint8Array(iv.length + ciphertext.length);
  macData.set(iv);
  macData.set(ciphertext, iv.length);

  const valid = await crypto.subtle.verify('HMAC', hmacKey, tag, macData);
  if (!valid) throw new Error('HMAC verification failed');

  return new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv },
    aesKey,
    ciphertext
  ));
}

/**
 * Encrypts data and returns result as base64 string.
 * 
 * @param {string|Uint8Array} data - Data to encrypt
 * @param {string|Uint8Array} password - Password for encryption
 * @returns {Promise<string>} - Base64 encoded encrypted string
 */
export async function encryptCbc(data, password) {
  const encrypted = await encryptCbcBin(data, password);
  return base64Encode(encrypted);
}

/**
 * Decrypts base64-encoded AES-CBC + HMAC data.
 * 
 * @param {string} data - Base64 encoded encrypted data
 * @param {string|Uint8Array} password - Password used for encryption
 * @returns {Promise<Uint8Array>} - Decrypted and unpadded data
 */
export async function decryptCbc(data, password) {
  const decoded = base64Decode(data);
  return decryptCbcBin(decoded, password);
}
