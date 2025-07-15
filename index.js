import { encryptCbc, encryptCbcBin, decryptCbc, decryptCbcBin } from "./cbc";
import { encryptGcm, encryptGcmBin, decryptGcm, decryptGcmBin } from "./gcm";
import { encryptLegacy, decryptLegacy } from "./legacy";

const encrypt = encryptGcm;
const decrypt = decryptGcm;

export {
  encrypt,
  decrypt,
  encryptCbc,
  decryptCbc,
  encryptCbcBin,
  decryptCbcBin,
  encryptGcm,
  decryptGcm,
  encryptGcmBin,
  decryptGcmBin,
  encryptLegacy,
  decryptLegacy
};
