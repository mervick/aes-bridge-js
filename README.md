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
<script src="https://cdn.jsdelivr.net/npm/aes-bridge@v2.0.0/dist/aes-bridge.umd.js"></script>
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
  **Returns:** base64-encoded string.
  
- `decrypt(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with AES-GCM.

### GCM Mode (recommended)

- `encryptGcm(data, passphrase)`  
  Encrypts a string using AES-GCM.
  **Returns:** base64-encoded string.

- `decryptGcm(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with `encryptGcm`.

- `encryptGcmBin(data, passphrase)`  
  Returns encrypted binary data using AES-GCM.

- `decryptGcmBin(ciphertext, passphrase)`  
  Decrypts binary data encrypted with `encryptGcmBin`.

### CBC Mode

- `encryptCbc(data, passphrase)`  
  Encrypts a string using AES-CBC. 
  HMAC is used for integrity verification.  
  **Returns:** base64-encoded string.  

- `decryptCbc(ciphertext, passphrase)`  
  Decrypts a base64-encoded string encrypted with `encryptCbc` and verifies HMAC.

- `encryptCbcBin(data, passphrase)`  
  Returns encrypted binary data using AES-CBC with HMAC.

- `decryptCbcBin(ciphertext, passphrase)`  
  Decrypts binary data encrypted with `encryptCbcBin` and verifies HMAC.

### Legacy Compatibility

⚠️ These functions are kept for backward compatibility only.
Their usage is strongly discouraged in new applications.

- `encryptLegacy(data, passphrase)`  
  Encrypts a string in the legacy AES Everywhere format.  

- `decryptLegacy(ciphertext, passphrase)`  
  Decrypts a string encrypted in the legacy AES Everywhere format.

