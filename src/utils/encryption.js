// src/utils/encryption.js
const CryptoJS = require('crypto-js');

const encryptionKey = process.env.ENCRYPTION_KEY || 'default_key_change_in_production';

exports.encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, encryptionKey).toString();
};

exports.decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, encryptionKey);
  return bytes.toString(CryptoJS.enc.Utf8);
};
