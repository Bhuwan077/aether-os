import { describe, it, expect } from 'vitest';
import {
  caesarEncrypt,
  caesarDecrypt,
  rot13,
  atbash,
  vigenereEncrypt,
  vigenereDecrypt,
  xorEncryptHex,
  xorDecryptHex,
  reverseCipher
} from '../engine/ciphers';
import { computeSha256, computeAvalanche } from '../engine/hashes';
import { gcd, modInverse, modPow, generateRsaKeys, rsaEncrypt, rsaDecrypt } from '../engine/rsa';
import {
  getMaxStegoCapacity,
  encodeMessageInImageData,
  decodeMessageFromImageData,
  generateSyntheticCarrier
} from '../engine/steganography';

describe('Classical Ciphers', () => {
  it('should encrypt and decrypt using Caesar cipher', () => {
    const plain = 'Hello, AetherOS 2026!';
    const encrypted = caesarEncrypt(plain, 5);
    expect(encrypted).toBe('Mjqqt, FjymjwTX 2026!');
    const decrypted = caesarDecrypt(encrypted, 5);
    expect(decrypted).toBe(plain);
  });

  it('should verify ROT13 reciprocal encryption', () => {
    const text = 'CipherStream Alpha';
    const rot = rot13(text);
    expect(rot13(rot)).toBe(text);
  });

  it('should verify Atbash reciprocal encryption', () => {
    const text = 'Wizard of Oz';
    const atb = atbash(text);
    expect(atbash(atb)).toBe(text);
  });

  it('should accurately reverse character strings', () => {
    expect(reverseCipher('AetherOS')).toBe('SOrehteA');
    expect(reverseCipher('12345')).toBe('54321');
  });

  it('should encrypt and decrypt using Vigenere cipher', () => {
    const plain = 'ATTACKATDAWN';
    const key = 'LEMON';
    const encrypted = vigenereEncrypt(plain, key);
    expect(encrypted).toBe('LXFOPVEFRNHR');
    const decrypted = vigenereDecrypt(encrypted, key);
    expect(decrypted).toBe(plain);
  });

  it('should encrypt and decrypt using XOR hex cipher', () => {
    const plain = 'TopSecretPayload#42';
    const key = 'CYBER_KEY';
    const hex = xorEncryptHex(plain, key);
    expect(hex.length).toBe(plain.length * 2);
    const decrypted = xorDecryptHex(hex, key);
    expect(decrypted).toBe(plain);
  });
});

describe('Cryptographic Hashing & Avalanche', () => {
  it('should compute exact SHA-256 for standard test vectors', () => {
    // Standard empty string SHA-256
    expect(computeSha256('')).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
    );
    // Standard 'abc' SHA-256
    expect(computeSha256('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad'
    );
  });

  it('should calculate avalanche effect showing substantial bit flips on single character delta', () => {
    const res = computeAvalanche('AetherOS', 'BetherOS');
    expect(res.hash1).not.toBe(res.hash2);
    expect(res.totalBits).toBe(256);
    expect(res.bitDiff).toBeGreaterThan(80); // Strict avalanche criterion
    expect(res.bitDiffPercentage).toBeGreaterThan(30);
    expect(res.bitMap.length).toBe(256);
  });
});

describe('RSA Modular Arithmetic', () => {
  it('should compute gcd and modular inverse correctly', () => {
    expect(gcd(54n, 24n)).toBe(6n);
    expect(gcd(17n, 3120n)).toBe(1n);

    // 3 * d = 1 mod 11 => d = 4
    expect(modInverse(3n, 11n)).toBe(4n);
  });

  it('should perform fast modular exponentiation', () => {
    // 4^13 mod 497 = 445
    expect(modPow(4n, 13n, 497n)).toBe(445n);
  });

  it('should generate valid RSA keys and round-trip encrypt/decrypt message', () => {
    const keys = generateRsaKeys(61n, 53n);
    expect(keys.n).toBe(3233n);
    expect(keys.phi).toBe(3120n);

    const message = 'KEY';
    const encrypted = rsaEncrypt(message, keys.e, keys.n);
    expect(encrypted.length).toBe(message.length);

    const decrypted = rsaDecrypt(encrypted, keys.d, keys.n);
    expect(decrypted).toBe(message);
  });
});

describe('LSB Steganography', () => {
  it('should calculate capacity and encode/decode secret payload', () => {
    const width = 64;
    const height = 64;
    const capacity = getMaxStegoCapacity(width, height);
    expect(capacity).toBeGreaterThan(1000);

    const rawData = generateSyntheticCarrier(width, height, 'cyber');
    const carrier = { data: rawData, width, height };

    const secret = 'AGENT-SECRET-ACCESS-TOKEN-2026';
    const encoded = encodeMessageInImageData(carrier, secret);
    expect(encoded).toBe(true);

    const decoded = decodeMessageFromImageData(carrier);
    expect(decoded).toBe(secret);
  });

  it('should refuse encoding when message exceeds carrier capacity', () => {
    const carrier = { data: new Uint8ClampedArray(4 * 4 * 4), width: 4, height: 4 };
    const massive = 'X'.repeat(500);
    const success = encodeMessageInImageData(carrier, massive);
    expect(success).toBe(false);
  });
});
