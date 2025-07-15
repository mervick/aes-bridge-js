/**
 * This file is part of AesBridge - modern cross-language AES encryption library
 * Repository: https://github.com/mervick/aes-bridge
 *
 * Copyright Andrey Izman (c) 2018-2025 <izmanw@gmail.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
