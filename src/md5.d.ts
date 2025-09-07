type InputType = string | number[] | Uint8Array | ArrayBuffer;

interface Md5 {
  update(message: InputType): Md5;
  hex(): string;
  toString(): string;
  digest(): number[];
  array(): number[];
  arrayBuffer(): ArrayBuffer;
  buffer(): ArrayBuffer;
  base64(): string;
}

interface HmacMd5 extends Md5 {}

interface Md5Static {
  (message: InputType): string;
  hex(message: InputType): string;
  array(message: InputType): number[];
  digest(message: InputType): number[];
  arrayBuffer(message: InputType): ArrayBuffer;
  buffer(message: InputType): ArrayBuffer;
  base64(message: InputType): string;
  create(): Md5;
  update(message: InputType): Md5;
  hmac: {
    (key: InputType, message: InputType): string;
    hex(key: InputType, message: InputType): string;
    array(key: InputType, message: InputType): number[];
    digest(key: InputType, message: InputType): number[];
    arrayBuffer(key: InputType, message: InputType): ArrayBuffer;
    buffer(key: InputType, message: InputType): ArrayBuffer;
    base64(key: InputType, message: InputType): string;
    create(key: InputType): HmacMd5;
    update(key: InputType, message: InputType): HmacMd5;
  };
}

declare const md5: Md5Static;
export default md5;