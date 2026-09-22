/**
 * Educational RSA Modular Arithmetic Key Generation and Cipher Engine
 * Uses BigInt for exact arbitrary-precision integer calculations.
 */

export interface RsaKeyPair {
  p: bigint;
  q: bigint;
  n: bigint;
  phi: bigint;
  e: bigint;
  d: bigint;
}

export function gcd(a: bigint, b: bigint): bigint {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y !== 0n) {
    const temp = y;
    y = x % y;
    x = temp;
  }
  return x;
}

export function modInverse(e: bigint, phi: bigint): bigint {
  let m0 = phi;
  let y = 0n;
  let x = 1n;

  if (phi === 1n) return 0n;

  let a = e;
  let b = phi;

  while (a > 1n) {
    if (b === 0n) {
      throw new Error('Inverse does not exist');
    }
    const q = a / b;
    let t = b;

    b = a % b;
    a = t;
    t = y;

    y = x - q * y;
    x = t;
  }

  if (x < 0n) {
    x += m0;
  }

  return x;
}

export function modPow(base: bigint, exponent: bigint, modulus: bigint): bigint {
  if (modulus === 1n) return 0n;
  let result = 1n;
  let b = base % modulus;
  let e = exponent;

  while (e > 0n) {
    if (e % 2n === 1n) {
      result = (result * b) % modulus;
    }
    e = e / 2n;
    b = (b * b) % modulus;
  }
  return result;
}

// Small prime pool for safe educational generation
const PRIME_CANDIDATES: number[] = [
  61, 53, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179,
  181, 191, 193, 197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277,
  281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359, 367, 373, 379, 383, 389,
  397, 401, 409, 419, 421, 431, 433, 439, 443, 449, 457, 461, 463, 467, 479, 487, 491, 499
];

export function isPrime(n: bigint): boolean {
  if (n <= 1n) return false;
  if (n <= 3n) return true;
  if (n % 2n === 0n || n % 3n === 0n) return false;

  for (let i = 5n; i * i <= n; i += 6n) {
    if (n % i === 0n || n % (i + 2n) === 0n) {
      return false;
    }
  }
  return true;
}

export function generateRsaKeys(customP?: bigint, customQ?: bigint): RsaKeyPair {
  let p = customP;
  let q = customQ;

  if (!p || !q) {
    const idx1 = Math.floor(Math.random() * PRIME_CANDIDATES.length);
    let idx2 = Math.floor(Math.random() * PRIME_CANDIDATES.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * PRIME_CANDIDATES.length);
    }
    p = BigInt(PRIME_CANDIDATES[idx1]);
    q = BigInt(PRIME_CANDIDATES[idx2]);
  }

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);

  // Pick e coprime with phi
  let e = 65537n;
  if (e >= phi || gcd(e, phi) !== 1n) {
    const commonE = [3n, 5n, 17n, 257n, 65537n];
    e = 0n;
    for (const cand of commonE) {
      if (cand < phi && gcd(cand, phi) === 1n) {
        e = cand;
        break;
      }
    }
    if (e === 0n) {
      for (let cand = 3n; cand < phi; cand += 2n) {
        if (gcd(cand, phi) === 1n) {
          e = cand;
          break;
        }
      }
    }
  }

  const d = modInverse(e, phi);

  return { p, q, n, phi, e, d };
}

export function rsaEncrypt(message: string, e: bigint, n: bigint): bigint[] {
  const cipherChunks: bigint[] = [];
  for (let i = 0; i < message.length; i++) {
    const m = BigInt(message.charCodeAt(i));
    cipherChunks.push(modPow(m, e, n));
  }
  return cipherChunks;
}

export function rsaDecrypt(cipherChunks: bigint[], d: bigint, n: bigint): string {
  let message = '';
  for (const c of cipherChunks) {
    const m = modPow(c, d, n);
    message += String.fromCharCode(Number(m));
  }
  return message;
}
