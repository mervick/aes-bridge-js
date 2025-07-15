/**
 * Converts a string to Uint8Array using UTF-8 encoding.
 * If input is already Uint8Array, returns it as-is.
 * 
 * @param {string|Uint8Array} input - Input string or bytes
 * @returns {Uint8Array}
 */
export function toBytes(input) {
  if (typeof input === 'string') {
    return new TextEncoder().encode(input);
  }
  return input;
}

/**
 * Converts an Uint8Array to string using UTF-8 encoding.
 * 
 * @param {Uint8Array} input - Input string
 * @returns {string}
 */
export function bytesToString(bytes) {
  if (bytes instanceof Uint8Array) {
    return new TextDecoder().decode(bytes);
  }
  return bytes;
}

/**
 * Generates a random Uint8Array of given length using secure crypto.
 * 
 * @param {number} length - Number of bytes to generate
 * @returns {Uint8Array}
 */
export function generateRandom(length) {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return array;
}

/**
 * Encodes bytes to base64 string.
 * 
 * @param {Uint8Array} bytes - Data to encode
 * @returns {string} - Base64 string
 */
export function base64Encode(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Decodes base64 string to Uint8Array.
 * 
 * @param {string} b64 - Base64 encoded string
 * @returns {Uint8Array}
 */
export function base64Decode(b64) {
  b64 = bytesToString(b64);
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
