import {
    encryptCbc, decryptCbc,
    encryptGcm, decryptGcm,
    encryptLegacy, decryptLegacy
} from '../src/index.js';

import { readFile } from 'node:fs/promises';
import { describe, it, expect } from 'vitest';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function fromHex(hex) {
    return Uint8Array.from(hex.match(/.{1,2}/g).map(b => parseInt(b, 16)));
}

function encodeInput(s, mode) {
    return mode === 'hex' ? fromHex(s) : encoder.encode(s);
}

function toUtf8(bytes) {
  return decoder.decode(bytes);
}

describe('AES Bridge Tests', async () => {

  const raw = await readFile(new URL('./test_data.json', import.meta.url));
  const json = JSON.parse(raw);

  const cases = [];

  // Group 1: simple test cases from .testdata.plaintext[]
  for (const [idx, str] of (json.testdata?.plaintext || []).entries()) {
    const value = encoder.encode(str);

    cases.push({
      id: `plaintext_${idx}`,
      input: value,
      pass: value,
    });
  }

  // Group 2: hex string testdata
  for (const [idx, hex] of (json.testdata?.hex || []).entries()) {
    const value = fromHex(hex);

    cases.push({
      id: `hex_${idx}`,
      input: value,
      pass: value,
    });
  }

  // Group 3: exact expected results from test_data["tests"]
  for (const [idx, test] of (json.decrypt || []).entries()) {
    const id = test.id || `case_${idx}`;
    const pass = test.passphrase;

    let input = test.hex
      ? fromHex(test.hex)
      : encoder.encode(test.plaintext);

    if (test['encrypted-cbc']) {
      cases.push({
        id: `cbc_${id}`,
        input,
        pass,
        expected: test['encrypted-cbc'],
        decrypt: decryptCbc
      });
    }

    if (test['encrypted-gcm']) {
      cases.push({
        id: `gcm_${id}`,
        input,
        pass,
        expected: test['encrypted-gcm'],
        decrypt: decryptGcm
      });
    }

    if (test['encrypted-legacy']) {
      cases.push({
        id: `legacy_${id}`,
        input,
        pass,
        expected: test['encrypted-legacy'],
        decrypt: decryptLegacy
      });
    }
  }

  // Define test blocks
  for (const test of cases) {

    if (test.expected && test.decrypt) {
      const name = `decrypt [${test.id}]`;
      it(name, async () => {
        const result = await test.decrypt(test.expected, test.pass);
        expect(toUtf8(result)).toBe(toUtf8(test.input));
      });
    } else {
      const name = `encrypt/decrypt [${test.id}]`;
      it(`${name} CBC`, async () => {
        const enc = await encryptCbc(test.input, test.pass);
        const dec = await decryptCbc(enc, test.pass);
        expect(toUtf8(dec)).toBe(toUtf8(test.input));
      });

      it(`${name} GCM`, async () => {
        const enc = await encryptGcm(test.input, test.pass);
        const dec = await decryptGcm(enc, test.pass);
        expect(toUtf8(dec)).toBe(toUtf8(test.input));
      });

      it(`${name} Legacy`, async () => {
        const enc = await encryptLegacy(test.input, test.pass);
        const dec = await decryptLegacy(enc, test.pass);
        expect(toUtf8(dec)).toBe(toUtf8(test.input));
      });
    }
  }
});
