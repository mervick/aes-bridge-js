export { encryptCbc, encryptCbcBin, decryptCbc, decryptCbcBin } from "./cbc";
export { encryptGcm, encryptGcmBin, decryptGcm, decryptGcmBin } from "./gcm";
export { encryptLegacy, decryptLegacy } from "./legacy";

export const encrypt: typeof import("./gcm").encryptGcm;
export const decrypt: typeof import("./gcm").decryptGcm;
