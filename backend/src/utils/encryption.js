const crypto = require('crypto');
require('dotenv').config();

// The encryption key from our .env file. It MUST be 32 bytes (256 bits).
// We fallback to a default in case it is missing during testing, but warn the user.
let ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn("⚠️ WARNING: ENCRYPTION_KEY in .env is not 32 characters! Falling back to a default key for development. THIS IS NOT SECURE FOR PRODUCTION.");
    ENCRYPTION_KEY = 'v9y$B&E)H@McQfTjWnZr4t7w!z%C*F-J'; // Fallback 32-char key
}

const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a string using AES-256-CBC.
 * @param {string} text - The cleartext to encrypt.
 * @returns {string|null} - The encrypted string format "hexIV:hexEncryptedData", or null if input is falsy.
 */
function encryptData(text) {
    if (!text) return text; // If no data, return as-is (null, undefined, etc.)

    try {
        // 1. Generate a random 16-byte Initialization Vector
        const iv = crypto.randomBytes(16);

        // 2. Create the cipher
        const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);

        // 3. Encrypt the data
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // 4. Return combined IV and Encrypted Text (so we can decrypt it later)
        return iv.toString('hex') + ':' + encrypted;
    } catch (err) {
        console.error("Encryption Error:", err);
        return null;
    }
}

/**
 * Decrypts a string formatted as "hexIV:hexEncryptedData" back to its original cleartext.
 * @param {string} text - The encrypted string to decrypt.
 * @returns {string|null} - The cleartext string, or the original text if it wasn't encrypted/failed.
 */
function decryptData(text) {
    if (!text) return text;

    // Check if the text matches our encrypted format (contains a colon)
    // If it doesn't, it might be legacy unencrypted data in the database!
    if (!text.includes(':')) {
        return text; // Return as-is (graceful fallback)
    }

    try {
        const textParts = text.split(':');
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');

        // Check if IV length is exactly 16 bytes. If not, this is likely corrupted or not our format.
        if (iv.length !== 16) {
           return text;
        }

        const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'utf-8'), iv);

        let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (err) {
        console.error("Decryption Error:", err);
        return text; // Return the raw text if decryption completely fails 
    }
}

module.exports = {
    encryptData,
    decryptData
};
