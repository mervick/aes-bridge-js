// import { md5 } from 'js-md5';
import md5 from './md5.js';
import { toBytes, generateRandom, base64Encode, base64Decode } from './common.js';

const BLOCK_SIZE = 16;
const KEY_LEN = 32;
const IV_LEN = 16;

/**
 * Encrypts plaintext using AES-256-CBC with OpenSSL-compatible format.
 * Output: Base64 encoded "Salted__" + salt(8) + ciphertext
 *
 * @param {string|Uint8Array} raw - Data to encrypt
 * @param {string|Uint8Array} passphrase - Password
 * @returns {string} - Base64 encoded ciphertext
 */
export async function encryptLegacy(raw, passphrase) {
  const salt = generateRandom(8);
  const { key, iv } = await deriveKeyAndIv(passphrase, salt);

  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv },
    key,
    toBytes(raw)
  ));

  const result = new Uint8Array(8 + 8 + ciphertext.length);
  result.set(toBytes('Salted__')); // 8 bytes
  result.set(salt, 8);
  result.set(ciphertext, 16);
  return base64Encode(result);
}

/**
 * Decrypts Base64-encoded AES-256-CBC data with OpenSSL-compatible format.
 *
 * @param {string} enc - Base64 encoded input
 * @param {string|Uint8Array} passphrase - Password
 * @returns {Promise<Uint8Array>} - Decrypted plaintext
 */
export async function decryptLegacy(enc, passphrase) {
  const ct = base64Decode(enc);
  if (String.fromCharCode(...ct.slice(0, 8)) !== 'Salted__') {
    throw new Error('Invalid OpenSSL header');
  }
  const salt = ct.slice(8, 16);
  const { key, iv } = await deriveKeyAndIv(passphrase, salt);

  return new Uint8Array(await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv },
    key,
    ct.slice(16)
  ));
}

/**
 * Derives key and IV using OpenSSL EVP_BytesToKey-style KDF (MD5).
 *
 * @param {string|Uint8Array} password
 * @param {Uint8Array} salt
 * @returns {Promise<{key: CryptoKey, iv: Uint8Array}>}
 */
async function deriveKeyAndIv(password, salt) {
  password = toBytes(password);
  let d = new Uint8Array(0);
  let prev = new Uint8Array(0);

  while (d.length < KEY_LEN + IV_LEN) {
    const data = concatUint8Arrays(prev, password, salt);
    prev = computeMd5(data);
    d = concatUint8Arrays(d, prev);
  }

  const keyBytes = d.slice(0, KEY_LEN);
  const iv = d.slice(KEY_LEN, KEY_LEN + IV_LEN);
  const key = await crypto.subtle.importKey('raw', keyBytes, 'AES-CBC', false, ['encrypt', 'decrypt']);

  return { key, iv };
}

/**
 * Computes MD5 hash.
 *
 * @param {Uint8Array} data
 * @returns {Uint8Array}
 */
function computeMd5(data) {
  // Если data — Uint8Array, преобразуем в строку или Buffer
  const input = data instanceof Uint8Array ? Buffer.from(data) : data;
  const hash = md5(input); // Вычисляем MD5
  return new Uint8Array(Buffer.from(hash, 'hex')); // Возвращаем Uint8Array
}

/**
 * Concatenates multiple Uint8Arrays.
 *
 * @param  {...Uint8Array} arrays
 * @returns {Uint8Array}
 */
function concatUint8Arrays(...arrays) {
  const totalLen = arrays.reduce((acc, val) => acc + val.length, 0);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }
  return result;
}
