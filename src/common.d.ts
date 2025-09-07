/**
 * Converts a string to Uint8Array using UTF-8 encoding.
 * If input is already Uint8Array, returns it as-is.
 */
export function toBytes(input: string | Uint8Array): Uint8Array;

/**
 * Converts an Uint8Array to string using UTF-8 encoding.
 */
export function bytesToString(bytes: Uint8Array | string): string;

/**
 * Generates a random Uint8Array of given length using secure crypto.
 */
export function generateRandom(length: number): Uint8Array;

/**
 * Encodes bytes to base64 string.
 */
export function base64Encode(bytes: Uint8Array): string;

/**
 * Decodes base64 string to Uint8Array.
 */
export function base64Decode(b64: string): Uint8Array;
