/**
 * Utility class for encrypting and decrypting data using the Web Crypto API.
 * Uses PBKDF2 to derive an AES-GCM key from a string PIN.
 */

// Helper to convert Uint8Array to Hex String
function buf2hex(buffer: Uint8Array | ArrayBuffer) {
  return Array.prototype.map.call(new Uint8Array(buffer as ArrayBuffer), x => ('00' + x.toString(16)).slice(-2)).join('');
}

// Helper to convert Hex String to Uint8Array
function hex2buf(hexString: string) {
  const result = [];
  for (let i = 0; i < hexString.length; i += 2) {
    result.push(parseInt(hexString.substring(i, i + 2), 16));
  }
  return new Uint8Array(result);
}

/**
 * Derives a CryptoKey from a PIN using PBKDF2
 */
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(pin),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts a string (e.g. JSON session) using a PIN.
 * Returns a hex string in the format: saltHex:ivHex:ciphertextHex
 */
export async function encryptSession(sessionData: string, pin: string): Promise<string> {
  // Generate random salt and IV
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // Derive key from PIN
  const key = await deriveKey(pin, salt);

  // Encrypt the data
  const enc = new TextEncoder();
  const encodedData = enc.encode(sessionData);

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    key,
    encodedData
  );

  // Combine to a single string: salt:iv:ciphertext
  const saltHex = buf2hex(salt);
  const ivHex = buf2hex(iv);
  const cipherHex = buf2hex(ciphertext);

  return `${saltHex}:${ivHex}:${cipherHex}`;
}

/**
 * Decrypts an encrypted session string using a PIN.
 * Throws an error if the PIN is incorrect or data is corrupted.
 */
export async function decryptSession(encryptedString: string, pin: string): Promise<string> {
  const parts = encryptedString.split(':');
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }

  const [saltHex, ivHex, cipherHex] = parts;
  const salt = hex2buf(saltHex);
  const iv = hex2buf(ivHex);
  const ciphertext = hex2buf(cipherHex);

  // Derive key from PIN
  const key = await deriveKey(pin, salt);

  try {
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      key,
      ciphertext
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (e) {
    // SubtleCrypto throws an OperationError if decryption fails (e.g. wrong key/PIN)
    throw new Error('PIN salah atau data rusak');
  }
}
