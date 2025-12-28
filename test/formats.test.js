import { describe, it, expect } from 'vitest';
import { spawnSync } from 'child_process';
import { readFileSync } from 'fs';
import { rmSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { writeFile, readFile } from 'fs/promises';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');
const projectRoot = path.dirname(__dirname);

describe('Build Formats Compatibility', () => {
  const testText = 'hello world';
  const testPass = 'MyStrongPass123';

  // 1. ESM test
  it('ESM import works', async () => {
    const { encryptGcm, decryptGcm } = await import('../dist/aes-bridge.esm.js');
    const ciphertext = await encryptGcm(testText, testPass);
    const decrypted = await decryptGcm(ciphertext, testPass);
    const plaintext = (new TextDecoder('utf-8')).decode(decrypted);
    expect(plaintext).toBe(testText);
  });

  // 2. CJS test
  it('CJS require works', () => {
    const result = spawnSync('node', [
      '-e',
      `const aes = require('${path.resolve(distDir, 'aes-bridge.cjs.js')}');
       console.log(JSON.stringify({
         success: typeof aes.encryptGcm === 'function',
         hasEncrypt: !!aes.encryptGcm
       }))`
    ]);

    const output = JSON.parse(result.stdout.toString());
    expect(output.success).toBe(true);
    expect(output.hasEncrypt).toBe(true);
  });

  // 3. UMD test
  it('UMD global works', () => {
    const umdContent = readFileSync(path.resolve(distDir, 'aes-bridge.umd.js'), 'utf8');
    const script = `(function() { ${umdContent} })();`;

    const vm = require('vm');
    const context = vm.createContext({ console, aes_bridge: null });
    vm.runInContext(script, context);

    expect(context.aes_bridge).toBeDefined();
    expect(typeof context.aes_bridge.encryptGcm).toBe('function');
  });

  // 4. npm pack test
  it('npm pack + require works', async () => {
    const tempDir = path.join(__dirname, 'temp-pack-test');

    try {
      rmSync(tempDir, { recursive: true, force: true });
    } catch (e) {
    }

    mkdirSync(tempDir, { recursive: true });

    await writeFile(
      path.join(tempDir, 'package.json'),
      JSON.stringify({
        name: 'test-consumer',
        version: '1.0.0',
        type: 'commonjs'
      })
    );

    const packResult = spawnSync('npm', ['pack'], {
      cwd: projectRoot,
      encoding: 'utf8'
    });

    const tgzFile = packResult.stdout.trim();
    const fullTgzPath = path.join(projectRoot, tgzFile);

    const installResult = spawnSync('npm', ['install', fullTgzPath], {
      cwd: tempDir,
      stdio: 'inherit'
    });

    expect(installResult.status).toBe(0);

    // Testing require
    const result = spawnSync('node', [
      '-e',
      `const aes = require('aes-bridge');
       (async()=>{
         try {
           if (!aes || !aes.encryptGcm) {
             throw new Error('No aes.encryptGcm');
           }
           const ct = await aes.encryptGcm('${testText}', '${testPass}');
           const decrypted = await aes.decryptGcm(ct, '${testPass}');
           const pt = (new TextDecoder('utf-8')).decode(decrypted);
           console.log(JSON.stringify({success: pt === '${testText}'}));
         } catch(e) {
           console.error('ERROR:', e.message);
           console.log(JSON.stringify({success: false, error: e.message}));
           process.exit(1);
         }
       })();`
    ], {
      cwd: tempDir,
      timeout: 5000
    });

    if (result.status !== 0) {
      console.error('Test result:', result.stderr.toString());
      throw new Error(`Require test failed with status ${result.status}`);
    }

    const output = JSON.parse(result.stdout.toString().trim());
    expect(output.success).toBe(true);
  });

  // 5. package.json exports
  it('package.json exports are correct', () => {
    const pkg = JSON.parse(readFileSync(path.resolve(projectRoot, 'package.json'), 'utf8'));
    const exports = pkg.exports['.'];

    expect(exports.types).toBe('./dist/index.d.ts');
    expect(exports.import).toBe('./dist/aes-bridge.esm.js');
    expect(exports.require).toBe('./dist/aes-bridge.cjs.js');
    expect(exports.default).toBe('./dist/aes-bridge.umd.js');
  });
});
