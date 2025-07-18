# AesBridge JS
![NPM Version](https://img.shields.io/npm/v/aes-bridge.svg)
![CI Status](https://github.com/mervick/aes-bridge-js/actions/workflows/tests.yml/badge.svg)

**AesBridge** is a modern, secure, and cross-language **AES** encryption library. It offers a unified interface for encrypting and decrypting data across multiple programming languages. Supports **GCM**, **CBC**, and **legacy AES Everywhere** modes.


This is the **JavaScript implementation** of the core project.  
👉 Main repository: https://github.com/mervick/aes-bridge

## Features

- 🔐 AES-256 encryption in GCM and CBC modes
- 🌍 Unified cross-language design
- 📦 Compact binary format or base64 output
- ✅ HMAC Integrity: CBC mode includes HMAC verification
- 🔄 Backward Compatible: Supports legacy AES Everywhere format
- 💻  Works in both Node.js and browsers (UMD + ESM + CJS)

## Quick Start

### Installation

```bash
npm install aes-bridge
# or
yarn add aes-bridge
```

### Usage

#### Browser (UMD)

```html
<script src="aes-bridge.umd.js"></script>
<script>
  const { encrypt, decrypt } = window.aes_bridge;

  const ciphertext = await encrypt("My secret message", "MyStrongPass")
  const plaintext = await decrypt(ciphertext, "MyStrongPass")
</script>
```

#### CDN Option
```html
<script src="https://cdn.jsdelivr.net/npm/aes-bridge@v2.0.5/dist/aes-bridge.umd.js"></script>
```

#### Node.js (ES Modules)
For Node.js applications using ES Modules:

```js
import { encrypt, decrypt } from 'aes-bridge';

const ciphertext = await encrypt('My secret message', 'MyStrongPass');
const plaintext = await decrypt(ciphertext, 'MyStrongPass');

```


## API Reference

### Main Functions (GCM by default)

- `encrypt(data, passphrase)`  
  Encrypts a string using AES-GCM (default).  
  **Returns:** `Promise<string>` - base64-encoded string.
  
- `decrypt(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with AES-GCM.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

### GCM Mode (recommended)

- `encryptGcm(data, passphrase)`  
  Encrypts a string using AES-GCM.  
  **Returns:** `Promise<string>` - base64-encoded string.

- `decryptGcm(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with `encryptGcm`.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

- `encryptGcmBin(data, passphrase)`  
  Returns encrypted binary data using AES-GCM.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.
  
- `decryptGcmBin(ciphertext, passphrase)`  
  Decrypts binary data encrypted with `encryptGcmBin`.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

### CBC Mode

- `encryptCbc(data, passphrase)`  
  Encrypts a string using AES-CBC. 
  HMAC is used for integrity verification.  
  **Returns:** `Promise<string>` - base64-encoded string.

- `decryptCbc(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with `encryptCbc` and verifies HMAC.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

- `encryptCbcBin(data, passphrase)`  
  Returns encrypted binary data using AES-CBC with HMAC.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

- `decryptCbcBin(ciphertext, passphrase)`  
  Decrypts binary data encrypted with `encryptCbcBin` and verifies HMAC.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

### Legacy Compatibility

⚠️ These functions are kept for backward compatibility only.
Their usage is strongly discouraged in new applications.

- `encryptLegacy(data, passphrase)`  
  Encrypts a string in the legacy AES Everywhere format.  
  **Returns:** `Promise<string>` - base64-encoded string.

- `decryptLegacy(ciphertext, passphrase)`  
  Decrypts a string encrypted in the legacy AES Everywhere format.  
  **Returns:** `Promise<Uint8Array>` - raw binary data.

---

### Return Types Overview

All functions in this library return a `Promise`. Specifically:

* `encrypt`, `encryptGcm`, `encryptCbc`, `encryptLegacy`  
**Returns:** `Promise<string>` - typically base64-encoded string.

* `encryptGcmBin`, `encryptCbcBin`,  
**Returns:** `Promise<Uint8Array>` - raw binary data.

* `decrypt`, `decryptGcm`, `decryptGcmBin`, `decryptCbc`, `decryptCbcBin`, `decryptLegacy`  
**Returns:** `Promise<Uint8Array>` - raw binary data.

---

### Converting `Uint8Array` to `string`

As noted above, decryption functions and binary encryption functions (those with `decrypt` or `Bin` in their name) return a `Promise<Uint8Array>`. If you need to convert this `Uint8Array` back into a human-readable string, you'll typically use the `TextDecoder` API, especially if the original data was a UTF-8 encoded string.

Here's an example of how you can convert the `Uint8Array` to a string:

```javascript
// Assuming decryptedResult is a Promise<Uint8Array> from a decryption function
const decryptedUint8Array = await decryptedResult; 
const decoder = new TextDecoder('utf-8', { fatal: true });
let finalStringResult;

try {
  finalStringResult = decoder.decode(decryptedUint8Array);
  console.log("Decrypted string:", finalStringResult);
} catch (e) {
  console.error("Decoding failed:", e);
  // Handle decoding errors, e.g., if the data is not valid UTF-8
}
```

The `fatal: true` option in `TextDecoder` will throw an error if the input contains malformed UTF-8 sequences, which can be helpful for debugging or ensuring data integrity.

