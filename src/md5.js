/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @version 0.8.3
 * @license MIT
 *
 * Copyright 2014-2023 Chen, Yi-Cyuan
 *
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var INPUT_ERROR = 'input is invalid type';
var FINALIZE_ERROR = 'finalize already called';
var NODE_JS = typeof process === 'object' && process.versions && process.versions.node;
var ARRAY_BUFFER = typeof ArrayBuffer !== 'undefined';
var HEX_CHARS = '0123456789abcdef'.split('');
var EXTRA = [128, 32768, 8388608, -2147483648];
var SHIFT = [0, 8, 16, 24];
var OUTPUT_TYPES = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer', 'base64'];
var BASE64_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

var blocks = [], buffer8;
if (ARRAY_BUFFER) {
  var buffer = new ArrayBuffer(68);
  buffer8 = new Uint8Array(buffer);
  blocks = new Uint32Array(buffer);
}

var isArray = Array.isArray;
if (!isArray) {
  isArray = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };
}

var isView = ArrayBuffer.isView;
if (ARRAY_BUFFER && !isView) {
  isView = function (obj) {
    return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
  };
}

// [message: string, isString: bool]
var formatMessage = function (message) {
  var type = typeof message;
  if (type === 'string') {
    return [message, true];
  }
  if (type !== 'object' || message === null) {
    throw new Error(INPUT_ERROR);
  }
  if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
    return [new Uint8Array(message), false];
  }
  if (!isArray(message) && !isView(message)) {
    throw new Error(INPUT_ERROR);
  }
  return [message, false];
}

/**
 * @method hex
 * @memberof md5
 * @description Output hash as hex string
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {String} Hex string
 * @example
 * md5.hex('The quick brown fox jumps over the lazy dog');
 * // equal to
 * md5('The quick brown fox jumps over the lazy dog');
 */
/**
 * @method digest
 * @memberof md5
 * @description Output hash as bytes array
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Array} Bytes array
 * @example
 * md5.digest('The quick brown fox jumps over the lazy dog');
 */
/**
 * @method array
 * @memberof md5
 * @description Output hash as bytes array
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Array} Bytes array
 * @example
 * md5.array('The quick brown fox jumps over the lazy dog');
 */
/**
 * @method arrayBuffer
 * @memberof md5
 * @description Output hash as ArrayBuffer
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {ArrayBuffer} ArrayBuffer
 * @example
 * md5.arrayBuffer('The quick brown fox jumps over the lazy dog');
 */
/**
 * @method buffer
 * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
 * @memberof md5
 * @description Output hash as ArrayBuffer
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {ArrayBuffer} ArrayBuffer
 * @example
 * md5.buffer('The quick brown fox jumps over the lazy dog');
 */
/**
 * @method base64
 * @memberof md5
 * @description Output hash as base64 string
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {String} base64 string
 * @example
 * md5.base64('The quick brown fox jumps over the lazy dog');
 */
var createOutputMethod = function (outputType) {
  return function (message) {
    return new Md5(true).update(message)[outputType]();
  };
};

/**
 * @method create
 * @memberof md5
 * @description Create Md5 object
 * @returns {Md5} Md5 object.
 * @example
 * var hash = md5.create();
 */
/**
 * @method update
 * @memberof md5
 * @description Create and update Md5 object
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Md5} Md5 object.
 * @example
 * var hash = md5.update('The quick brown fox jumps over the lazy dog');
 * // equal to
 * var hash = md5.create();
 * hash.update('The quick brown fox jumps over the lazy dog');
 */
var createMethod = function () {
  var method = createOutputMethod('hex');
  // if (NODE_JS) {
  //   method = nodeWrap(method);
  // }
  method.create = function () {
    return new Md5();
  };
  method.update = function (message) {
    return method.create().update(message);
  };
  for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
    var type = OUTPUT_TYPES[i];
    method[type] = createOutputMethod(type);
  }
  return method;
};

var nodeWrap = function (method) {
  var crypto = require('crypto')
  var Buffer = require('buffer').Buffer;
  var bufferFrom;
  if (Buffer.from) {
    bufferFrom = Buffer.from;
  } else {
    bufferFrom = function (message) {
      return new Buffer(message);
    };
  }
  var nodeMethod = function (message) {
    if (typeof message === 'string') {
      return crypto.createHash('md5').update(message, 'utf8').digest('hex');
    } else {
      if (message === null || message === undefined) {
        throw new Error(INPUT_ERROR);
      } else if (message.constructor === ArrayBuffer) {
        message = new Uint8Array(message);
      }
    }
    if (isArray(message) || isView(message) ||
      message.constructor === Buffer) {
      return crypto.createHash('md5').update(bufferFrom(message)).digest('hex');
    } else {
      return method(message);
    }
  };
  return nodeMethod;
};

/**
 * @namespace md5.hmac
 */
/**
 * @method hex
 * @memberof md5.hmac
 * @description Output hash as hex string
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {String} Hex string
 * @example
 * md5.hmac.hex('key', 'The quick brown fox jumps over the lazy dog');
 * // equal to
 * md5.hmac('key', 'The quick brown fox jumps over the lazy dog');
 */

/**
 * @method digest
 * @memberof md5.hmac
 * @description Output hash as bytes array
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Array} Bytes array
 * @example
 * md5.hmac.digest('key', 'The quick brown fox jumps over the lazy dog');
 */
/**
 * @method array
 * @memberof md5.hmac
 * @description Output hash as bytes array
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Array} Bytes array
 * @example
 * md5.hmac.array('key', 'The quick brown fox jumps over the lazy dog');
 */
/**
 * @method arrayBuffer
 * @memberof md5.hmac
 * @description Output hash as ArrayBuffer
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {ArrayBuffer} ArrayBuffer
 * @example
 * md5.hmac.arrayBuffer('key', 'The quick brown fox jumps over the lazy dog');
 */
/**
 * @method buffer
 * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
 * @memberof md5.hmac
 * @description Output hash as ArrayBuffer
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {ArrayBuffer} ArrayBuffer
 * @example
 * md5.hmac.buffer('key', 'The quick brown fox jumps over the lazy dog');
 */
/**
 * @method base64
 * @memberof md5.hmac
 * @description Output hash as base64 string
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {String} base64 string
 * @example
 * md5.hmac.base64('key', 'The quick brown fox jumps over the lazy dog');
 */
var createHmacOutputMethod = function (outputType) {
  return function (key, message) {
    return new HmacMd5(key, true).update(message)[outputType]();
  };
};

/**
 * @method create
 * @memberof md5.hmac
 * @description Create HmacMd5 object
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @returns {HmacMd5} HmacMd5 object.
 * @example
 * var hash = md5.hmac.create('key');
 */
/**
 * @method update
 * @memberof md5.hmac
 * @description Create and update HmacMd5 object
 * @param {String|Array|Uint8Array|ArrayBuffer} key key
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {HmacMd5} HmacMd5 object.
 * @example
 * var hash = md5.hmac.update('key', 'The quick brown fox jumps over the lazy dog');
 * // equal to
 * var hash = md5.hmac.create('key');
 * hash.update('The quick brown fox jumps over the lazy dog');
 */
var createHmacMethod = function () {
  var method = createHmacOutputMethod('hex');
  method.create = function (key) {
    return new HmacMd5(key);
  };
  method.update = function (key, message) {
    return method.create(key).update(message);
  };
  for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
    var type = OUTPUT_TYPES[i];
    method[type] = createHmacOutputMethod(type);
  }
  return method;
};

/**
 * Md5 class
 * @class Md5
 * @description This is internal class.
 * @see {@link md5.create}
 */
function Md5(sharedMemory) {
  if (sharedMemory) {
    blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] =
    blocks[4] = blocks[5] = blocks[6] = blocks[7] =
    blocks[8] = blocks[9] = blocks[10] = blocks[11] =
    blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    this.blocks = blocks;
    this.buffer8 = buffer8;
  } else {
    if (ARRAY_BUFFER) {
      var buffer = new ArrayBuffer(68);
      this.buffer8 = new Uint8Array(buffer);
      this.blocks = new Uint32Array(buffer);
    } else {
      this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    }
  }
  this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0;
  this.finalized = this.hashed = false;
  this.first = true;
}

/**
 * @method update
 * @memberof Md5
 * @instance
 * @description Update hash
 * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
 * @returns {Md5} Md5 object.
 * @see {@link md5.update}
 */
Md5.prototype.update = function (message) {
  if (this.finalized) {
    throw new Error(FINALIZE_ERROR);
  }

  var result = formatMessage(message);
  message = result[0];
  var isString = result[1];
  var code, index = 0, i, length = message.length, blocks = this.blocks;
  var buffer8 = this.buffer8;

  while (index < length) {
    if (this.hashed) {
      this.hashed = false;
      blocks[0] = blocks[16];
      blocks[16] = blocks[1] = blocks[2] = blocks[3] =
      blocks[4] = blocks[5] = blocks[6] = blocks[7] =
      blocks[8] = blocks[9] = blocks[10] = blocks[11] =
      blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
    }

    if (isString) {
      if (ARRAY_BUFFER) {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            buffer8[i++] = code;
          } else if (code < 0x800) {
            buffer8[i++] = 0xc0 | (code >>> 6);
            buffer8[i++] = 0x80 | (code & 0x3f);
          } else if (code < 0xd800 || code >= 0xe000) {
            buffer8[i++] = 0xe0 | (code >>> 12);
            buffer8[i++] = 0x80 | ((code >>> 6) & 0x3f);
            buffer8[i++] = 0x80 | (code & 0x3f);
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            buffer8[i++] = 0xf0 | (code >>> 18);
            buffer8[i++] = 0x80 | ((code >>> 12) & 0x3f);
            buffer8[i++] = 0x80 | ((code >>> 6) & 0x3f);
            buffer8[i++] = 0x80 | (code & 0x3f);
          }
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >>> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >>> 2] |= (0xc0 | (code >>> 6)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >>> 2] |= (0xe0 | (code >>> 12)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >>> 2] |= (0xf0 | (code >>> 18)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | ((code >>> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >>> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
    } else {
      if (ARRAY_BUFFER) {
        for (i = this.start; index < length && i < 64; ++index) {
          buffer8[i++] = message[index];
        }
      } else {
        for (i = this.start; index < length && i < 64; ++index) {
          blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
        }
      }
    }
    this.lastByteIndex = i;
    this.bytes += i - this.start;
    if (i >= 64) {
      this.start = i - 64;
      this.hash();
      this.hashed = true;
    } else {
      this.start = i;
    }
  }
  if (this.bytes > 4294967295) {
    this.hBytes += this.bytes / 4294967296 << 0;
    this.bytes = this.bytes % 4294967296;
  }
  return this;
};

Md5.prototype.finalize = function () {
  if (this.finalized) {
    return;
  }
  this.finalized = true;
  var blocks = this.blocks, i = this.lastByteIndex;
  blocks[i >>> 2] |= EXTRA[i & 3];
  if (i >= 56) {
    if (!this.hashed) {
      this.hash();
    }
    blocks[0] = blocks[16];
    blocks[16] = blocks[1] = blocks[2] = blocks[3] =
    blocks[4] = blocks[5] = blocks[6] = blocks[7] =
    blocks[8] = blocks[9] = blocks[10] = blocks[11] =
    blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
  }
  blocks[14] = this.bytes << 3;
  blocks[15] = this.hBytes << 3 | this.bytes >>> 29;
  this.hash();
};

Md5.prototype.hash = function () {
  var a, b, c, d, bc, da, blocks = this.blocks;

  if (this.first) {
    a = blocks[0] - 680876937;
    a = (a << 7 | a >>> 25) - 271733879 << 0;
    d = (-1732584194 ^ a & 2004318071) + blocks[1] - 117830708;
    d = (d << 12 | d >>> 20) + a << 0;
    c = (-271733879 ^ (d & (a ^ -271733879))) + blocks[2] - 1126478375;
    c = (c << 17 | c >>> 15) + d << 0;
    b = (a ^ (c & (d ^ a))) + blocks[3] - 1316259209;
    b = (b << 22 | b >>> 10) + c << 0;
  } else {
    a = this.h0;
    b = this.h1;
    c = this.h2;
    d = this.h3;
    a += (d ^ (b & (c ^ d))) + blocks[0] - 680876936;
    a = (a << 7 | a >>> 25) + b << 0;
    d += (c ^ (a & (b ^ c))) + blocks[1] - 389564586;
    d = (d << 12 | d >>> 20) + a << 0;
    c += (b ^ (d & (a ^ b))) + blocks[2] + 606105819;
    c = (c << 17 | c >>> 15) + d << 0;
    b += (a ^ (c & (d ^ a))) + blocks[3] - 1044525330;
    b = (b << 22 | b >>> 10) + c << 0;
  }

  a += (d ^ (b & (c ^ d))) + blocks[4] - 176418897;
  a = (a << 7 | a >>> 25) + b << 0;
  d += (c ^ (a & (b ^ c))) + blocks[5] + 1200080426;
  d = (d << 12 | d >>> 20) + a << 0;
  c += (b ^ (d & (a ^ b))) + blocks[6] - 1473231341;
  c = (c << 17 | c >>> 15) + d << 0;
  b += (a ^ (c & (d ^ a))) + blocks[7] - 45705983;
  b = (b << 22 | b >>> 10) + c << 0;
  a += (d ^ (b & (c ^ d))) + blocks[8] + 1770035416;
  a = (a << 7 | a >>> 25) + b << 0;
  d += (c ^ (a & (b ^ c))) + blocks[9] - 1958414417;
  d = (d << 12 | d >>> 20) + a << 0;
  c += (b ^ (d & (a ^ b))) + blocks[10] - 42063;
  c = (c << 17 | c >>> 15) + d << 0;
  b += (a ^ (c & (d ^ a))) + blocks[11] - 1990404162;
  b = (b << 22 | b >>> 10) + c << 0;
  a += (d ^ (b & (c ^ d))) + blocks[12] + 1804603682;
  a = (a << 7 | a >>> 25) + b << 0;
  d += (c ^ (a & (b ^ c))) + blocks[13] - 40341101;
  d = (d << 12 | d >>> 20) + a << 0;
  c += (b ^ (d & (a ^ b))) + blocks[14] - 1502002290;
  c = (c << 17 | c >>> 15) + d << 0;
  b += (a ^ (c & (d ^ a))) + blocks[15] + 1236535329;
  b = (b << 22 | b >>> 10) + c << 0;
  a += (c ^ (d & (b ^ c))) + blocks[1] - 165796510;
  a = (a << 5 | a >>> 27) + b << 0;
  d += (b ^ (c & (a ^ b))) + blocks[6] - 1069501632;
  d = (d << 9 | d >>> 23) + a << 0;
  c += (a ^ (b & (d ^ a))) + blocks[11] + 643717713;
  c = (c << 14 | c >>> 18) + d << 0;
  b += (d ^ (a & (c ^ d))) + blocks[0] - 373897302;
  b = (b << 20 | b >>> 12) + c << 0;
  a += (c ^ (d & (b ^ c))) + blocks[5] - 701558691;
  a = (a << 5 | a >>> 27) + b << 0;
  d += (b ^ (c & (a ^ b))) + blocks[10] + 38016083;
  d = (d << 9 | d >>> 23) + a << 0;
  c += (a ^ (b & (d ^ a))) + blocks[15] - 660478335;
  c = (c << 14 | c >>> 18) + d << 0;
  b += (d ^ (a & (c ^ d))) + blocks[4] - 405537848;
  b = (b << 20 | b >>> 12) + c << 0;
  a += (c ^ (d & (b ^ c))) + blocks[9] + 568446438;
  a = (a << 5 | a >>> 27) + b << 0;
  d += (b ^ (c & (a ^ b))) + blocks[14] - 1019803690;
  d = (d << 9 | d >>> 23) + a << 0;
  c += (a ^ (b & (d ^ a))) + blocks[3] - 187363961;
  c = (c << 14 | c >>> 18) + d << 0;
  b += (d ^ (a & (c ^ d))) + blocks[8] + 1163531501;
  b = (b << 20 | b >>> 12) + c << 0;
  a += (c ^ (d & (b ^ c))) + blocks[13] - 1444681467;
  a = (a << 5 | a >>> 27) + b << 0;
  d += (b ^ (c & (a ^ b))) + blocks[2] - 51403784;
  d = (d << 9 | d >>> 23) + a << 0;
  c += (a ^ (b & (d ^ a))) + blocks[7] + 1735328473;
  c = (c << 14 | c >>> 18) + d << 0;
  b += (d ^ (a & (c ^ d))) + blocks[12] - 1926607734;
  b = (b << 20 | b >>> 12) + c << 0;
  bc = b ^ c;
  a += (bc ^ d) + blocks[5] - 378558;
  a = (a << 4 | a >>> 28) + b << 0;
  d += (bc ^ a) + blocks[8] - 2022574463;
  d = (d << 11 | d >>> 21) + a << 0;
  da = d ^ a;
  c += (da ^ b) + blocks[11] + 1839030562;
  c = (c << 16 | c >>> 16) + d << 0;
  b += (da ^ c) + blocks[14] - 35309556;
  b = (b << 23 | b >>> 9) + c << 0;
  bc = b ^ c;
  a += (bc ^ d) + blocks[1] - 1530992060;
  a = (a << 4 | a >>> 28) + b << 0;
  d += (bc ^ a) + blocks[4] + 1272893353;
  d = (d << 11 | d >>> 21) + a << 0;
  da = d ^ a;
  c += (da ^ b) + blocks[7] - 155497632;
  c = (c << 16 | c >>> 16) + d << 0;
  b += (da ^ c) + blocks[10] - 1094730640;
  b = (b << 23 | b >>> 9) + c << 0;
  bc = b ^ c;
  a += (bc ^ d) + blocks[13] + 681279174;
  a = (a << 4 | a >>> 28) + b << 0;
  d += (bc ^ a) + blocks[0] - 358537222;
  d = (d << 11 | d >>> 21) + a << 0;
  da = d ^ a;
  c += (da ^ b) + blocks[3] - 722521979;
  c = (c << 16 | c >>> 16) + d << 0;
  b += (da ^ c) + blocks[6] + 76029189;
  b = (b << 23 | b >>> 9) + c << 0;
  bc = b ^ c;
  a += (bc ^ d) + blocks[9] - 640364487;
  a = (a << 4 | a >>> 28) + b << 0;
  d += (bc ^ a) + blocks[12] - 421815835;
  d = (d << 11 | d >>> 21) + a << 0;
  da = d ^ a;
  c += (da ^ b) + blocks[15] + 530742520;
  c = (c << 16 | c >>> 16) + d << 0;
  b += (da ^ c) + blocks[2] - 995338651;
  b = (b << 23 | b >>> 9) + c << 0;
  a += (c ^ (b | ~d)) + blocks[0] - 198630844;
  a = (a << 6 | a >>> 26) + b << 0;
  d += (b ^ (a | ~c)) + blocks[7] + 1126891415;
  d = (d << 10 | d >>> 22) + a << 0;
  c += (a ^ (d | ~b)) + blocks[14] - 1416354905;
  c = (c << 15 | c >>> 17) + d << 0;
  b += (d ^ (c | ~a)) + blocks[5] - 57434055;
  b = (b << 21 | b >>> 11) + c << 0;
  a += (c ^ (b | ~d)) + blocks[12] + 1700485571;
  a = (a << 6 | a >>> 26) + b << 0;
  d += (b ^ (a | ~c)) + blocks[3] - 1894986606;
  d = (d << 10 | d >>> 22) + a << 0;
  c += (a ^ (d | ~b)) + blocks[10] - 1051523;
  c = (c << 15 | c >>> 17) + d << 0;
  b += (d ^ (c | ~a)) + blocks[1] - 2054922799;
  b = (b << 21 | b >>> 11) + c << 0;
  a += (c ^ (b | ~d)) + blocks[8] + 1873313359;
  a = (a << 6 | a >>> 26) + b << 0;
  d += (b ^ (a | ~c)) + blocks[15] - 30611744;
  d = (d << 10 | d >>> 22) + a << 0;
  c += (a ^ (d | ~b)) + blocks[6] - 1560198380;
  c = (c << 15 | c >>> 17) + d << 0;
  b += (d ^ (c | ~a)) + blocks[13] + 1309151649;
  b = (b << 21 | b >>> 11) + c << 0;
  a += (c ^ (b | ~d)) + blocks[4] - 145523070;
  a = (a << 6 | a >>> 26) + b << 0;
  d += (b ^ (a | ~c)) + blocks[11] - 1120210379;
  d = (d << 10 | d >>> 22) + a << 0;
  c += (a ^ (d | ~b)) + blocks[2] + 718787259;
  c = (c << 15 | c >>> 17) + d << 0;
  b += (d ^ (c | ~a)) + blocks[9] - 343485551;
  b = (b << 21 | b >>> 11) + c << 0;

  if (this.first) {
    this.h0 = a + 1732584193 << 0;
    this.h1 = b - 271733879 << 0;
    this.h2 = c - 1732584194 << 0;
    this.h3 = d + 271733878 << 0;
    this.first = false;
  } else {
    this.h0 = this.h0 + a << 0;
    this.h1 = this.h1 + b << 0;
    this.h2 = this.h2 + c << 0;
    this.h3 = this.h3 + d << 0;
  }
};

/**
 * @method hex
 * @memberof Md5
 * @instance
 * @description Output hash as hex string
 * @returns {String} Hex string
 * @see {@link md5.hex}
 * @example
 * hash.hex();
 */
Md5.prototype.hex = function () {
  this.finalize();

  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;

  return HEX_CHARS[(h0 >>> 4) & 0x0F] + HEX_CHARS[h0 & 0x0F] +
    HEX_CHARS[(h0 >>> 12) & 0x0F] + HEX_CHARS[(h0 >>> 8) & 0x0F] +
    HEX_CHARS[(h0 >>> 20) & 0x0F] + HEX_CHARS[(h0 >>> 16) & 0x0F] +
    HEX_CHARS[(h0 >>> 28) & 0x0F] + HEX_CHARS[(h0 >>> 24) & 0x0F] +
    HEX_CHARS[(h1 >>> 4) & 0x0F] + HEX_CHARS[h1 & 0x0F] +
    HEX_CHARS[(h1 >>> 12) & 0x0F] + HEX_CHARS[(h1 >>> 8) & 0x0F] +
    HEX_CHARS[(h1 >>> 20) & 0x0F] + HEX_CHARS[(h1 >>> 16) & 0x0F] +
    HEX_CHARS[(h1 >>> 28) & 0x0F] + HEX_CHARS[(h1 >>> 24) & 0x0F] +
    HEX_CHARS[(h2 >>> 4) & 0x0F] + HEX_CHARS[h2 & 0x0F] +
    HEX_CHARS[(h2 >>> 12) & 0x0F] + HEX_CHARS[(h2 >>> 8) & 0x0F] +
    HEX_CHARS[(h2 >>> 20) & 0x0F] + HEX_CHARS[(h2 >>> 16) & 0x0F] +
    HEX_CHARS[(h2 >>> 28) & 0x0F] + HEX_CHARS[(h2 >>> 24) & 0x0F] +
    HEX_CHARS[(h3 >>> 4) & 0x0F] + HEX_CHARS[h3 & 0x0F] +
    HEX_CHARS[(h3 >>> 12) & 0x0F] + HEX_CHARS[(h3 >>> 8) & 0x0F] +
    HEX_CHARS[(h3 >>> 20) & 0x0F] + HEX_CHARS[(h3 >>> 16) & 0x0F] +
    HEX_CHARS[(h3 >>> 28) & 0x0F] + HEX_CHARS[(h3 >>> 24) & 0x0F];
};

/**
 * @method toString
 * @memberof Md5
 * @instance
 * @description Output hash as hex string
 * @returns {String} Hex string
 * @see {@link md5.hex}
 * @example
 * hash.toString();
 */
Md5.prototype.toString = Md5.prototype.hex;

/**
 * @method digest
 * @memberof Md5
 * @instance
 * @description Output hash as bytes array
 * @returns {Array} Bytes array
 * @see {@link md5.digest}
 * @example
 * hash.digest();
 */
Md5.prototype.digest = function () {
  this.finalize();

  var h0 = this.h0, h1 = this.h1, h2 = this.h2, h3 = this.h3;
  return [
    h0 & 0xFF, (h0 >>> 8) & 0xFF, (h0 >>> 16) & 0xFF, (h0 >>> 24) & 0xFF,
    h1 & 0xFF, (h1 >>> 8) & 0xFF, (h1 >>> 16) & 0xFF, (h1 >>> 24) & 0xFF,
    h2 & 0xFF, (h2 >>> 8) & 0xFF, (h2 >>> 16) & 0xFF, (h2 >>> 24) & 0xFF,
    h3 & 0xFF, (h3 >>> 8) & 0xFF, (h3 >>> 16) & 0xFF, (h3 >>> 24) & 0xFF
  ];
};

/**
 * @method array
 * @memberof Md5
 * @instance
 * @description Output hash as bytes array
 * @returns {Array} Bytes array
 * @see {@link md5.array}
 * @example
 * hash.array();
 */
Md5.prototype.array = Md5.prototype.digest;

/**
 * @method arrayBuffer
 * @memberof Md5
 * @instance
 * @description Output hash as ArrayBuffer
 * @returns {ArrayBuffer} ArrayBuffer
 * @see {@link md5.arrayBuffer}
 * @example
 * hash.arrayBuffer();
 */
Md5.prototype.arrayBuffer = function () {
  this.finalize();

  var buffer = new ArrayBuffer(16);
  var blocks = new Uint32Array(buffer);
  blocks[0] = this.h0;
  blocks[1] = this.h1;
  blocks[2] = this.h2;
  blocks[3] = this.h3;
  return buffer;
};

/**
 * @method buffer
 * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
 * @memberof Md5
 * @instance
 * @description Output hash as ArrayBuffer
 * @returns {ArrayBuffer} ArrayBuffer
 * @see {@link md5.buffer}
 * @example
 * hash.buffer();
 */
Md5.prototype.buffer = Md5.prototype.arrayBuffer;

/**
 * @method base64
 * @memberof Md5
 * @instance
 * @description Output hash as base64 string
 * @returns {String} base64 string
 * @see {@link md5.base64}
 * @example
 * hash.base64();
 */
Md5.prototype.base64 = function () {
  var v1, v2, v3, base64Str = '', bytes = this.array();
  for (var i = 0; i < 15;) {
    v1 = bytes[i++];
    v2 = bytes[i++];
    v3 = bytes[i++];
    base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] +
      BASE64_ENCODE_CHAR[(v1 << 4 | v2 >>> 4) & 63] +
      BASE64_ENCODE_CHAR[(v2 << 2 | v3 >>> 6) & 63] +
      BASE64_ENCODE_CHAR[v3 & 63];
  }
  v1 = bytes[i];
  base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] +
    BASE64_ENCODE_CHAR[(v1 << 4) & 63] +
    '==';
  return base64Str;
};

/**
 * HmacMd5 class
 * @class HmacMd5
 * @extends Md5
 * @description This is internal class.
 * @see {@link md5.hmac.create}
 */
function HmacMd5(key, sharedMemory) {
  var i, result = formatMessage(key);
  key = result[0];
  if (result[1]) {
    var bytes = [], length = key.length, index = 0, code;
    for (i = 0; i < length; ++i) {
      code = key.charCodeAt(i);
      if (code < 0x80) {
        bytes[index++] = code;
      } else if (code < 0x800) {
        bytes[index++] = (0xc0 | (code >>> 6));
        bytes[index++] = (0x80 | (code & 0x3f));
      } else if (code < 0xd800 || code >= 0xe000) {
        bytes[index++] = (0xe0 | (code >>> 12));
        bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
        bytes[index++] = (0x80 | (code & 0x3f));
      } else {
        code = 0x10000 + (((code & 0x3ff) << 10) | (key.charCodeAt(++i) & 0x3ff));
        bytes[index++] = (0xf0 | (code >>> 18));
        bytes[index++] = (0x80 | ((code >>> 12) & 0x3f));
        bytes[index++] = (0x80 | ((code >>> 6) & 0x3f));
        bytes[index++] = (0x80 | (code & 0x3f));
      }
    }
    key = bytes;
  }

  if (key.length > 64) {
    key = (new Md5(true)).update(key).array();
  }

  var oKeyPad = [], iKeyPad = [];
  for (i = 0; i < 64; ++i) {
    var b = key[i] || 0;
    oKeyPad[i] = 0x5c ^ b;
    iKeyPad[i] = 0x36 ^ b;
  }

  Md5.call(this, sharedMemory);

  this.update(iKeyPad);
  this.oKeyPad = oKeyPad;
  this.inner = true;
  this.sharedMemory = sharedMemory;
}
HmacMd5.prototype = new Md5();

HmacMd5.prototype.finalize = function () {
  Md5.prototype.finalize.call(this);
  if (this.inner) {
    this.inner = false;
    var innerHash = this.array();
    Md5.call(this, this.sharedMemory);
    this.update(this.oKeyPad);
    this.update(innerHash);
    Md5.prototype.finalize.call(this);
  }
};

const md5 = createMethod();
export default md5;
