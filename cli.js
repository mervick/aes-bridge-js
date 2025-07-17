#!/usr/bin/env node

import { Command } from 'commander';
import {
  encryptCbc, decryptCbc
} from './src/cbc.js';
import {
  encryptGcm, decryptGcm
} from './src/gcm.js';
import {
  encryptLegacy, decryptLegacy
} from './src/legacy.js';

const program = new Command();

program
  .name('aes-bridge-js')
  .description('AES Encryption/Decryption CLI for AesBridge-JS.')
  .version('2.0.5');

program
  .command('encrypt')
  .description('Encrypt data.')
  .requiredOption('--mode <mode>', 'Encryption mode: cbc, gcm, or legacy.', ['cbc', 'gcm', 'legacy'])
  .requiredOption('--data <data>', 'Data to encrypt (UTF-8 string or base64 if --b64 is used).')
  .requiredOption('--passphrase <passphrase>', 'Passphrase for key derivation.')
  .option('--b64', 'Expects base64 encoded input and returns base64 encoded output.', false)
  .action(async (options) => {
      try {
          let dataToProcess = options.data;
          if (options.b64) {
              // If --b64 is true, data should be treated as base64 encoded.
              // We decode it to a Buffer here to ensure consistent input type for encryption functions.
              dataToProcess = Buffer.from(options.data, 'base64');
          } else {
              // If not --b64, treat as UTF-8 string.
              dataToProcess = Buffer.from(options.data, 'utf8');
          }

          let result;
          switch (options.mode) {
              case 'cbc':
                  result = await encryptCbc(dataToProcess, options.passphrase);
                  break;
              case 'gcm':
                  result = await encryptGcm(dataToProcess, options.passphrase);
                  break;
              case 'legacy':
                  result = await encryptLegacy(dataToProcess, options.passphrase);
                  break;
              default:
                  throw new Error('Invalid encryption mode.');
          }
          console.log(result.toString('utf8'));
      } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
      }
  });

program
  .command('decrypt')
  .description('Decrypt data.')
  .requiredOption('--mode <mode>', 'Encryption mode: cbc, gcm, or legacy.', ['cbc', 'gcm', 'legacy'])
  .requiredOption('--data <data>', 'Data to decrypt (base64 string).')
  .requiredOption('--passphrase <passphrase>', 'Passphrase for key derivation.')
  .option('--b64', 'Returns base64 encoded output.', false)
  .action(async (options) => {
      try {
          // Decryption functions expect base64 string as input.
          const dataToProcess = options.data;

          let decryptedResult;
          switch (options.mode) {
              case 'cbc':
                  decryptedResult = await decryptCbc(dataToProcess, options.passphrase);
                  break;
              case 'gcm':
                  decryptedResult = await decryptGcm(dataToProcess, options.passphrase);
                  break;
              case 'legacy':
                  decryptedResult = await decryptLegacy(dataToProcess, options.passphrase);
                  break;
              default:
                  throw new Error('Invalid decryption mode.');
          }

          const decoder = new TextDecoder('utf-8', { fatal: true });
          decryptedResult = decoder.decode(decryptedResult);

          if (options.b64) {
              // If --b64, encode the decrypted result to base64.
              console.log(decryptedResult.toString('base64'));
          } else {
              // Otherwise, assume it's UTF-8 and print.
              console.log(decryptedResult.toString('utf8'));
          }
      } catch (error) {
          console.error(`Error: ${error.message}`);
          process.exit(1);
      }
  });

program.parse(process.argv);
