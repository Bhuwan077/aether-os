/**
 * Classical and symmetric cipher implementations
 */

export function caesarEncrypt(text: string, shift: number): string {
  const s = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const base = isUpper ? 65 : 97;
    return String.fromCharCode(((code - base + s) % 26) + base);
  });
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}

export function rot13(text: string): string {
  return caesarEncrypt(text, 13);
}

export function atbash(text: string): string {
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(90 - (code - 65));
    } else {
      return String.fromCharCode(122 - (code - 97));
    }
  });
}

export function reverseCipher(text: string): string {
  return text.split('').reverse().join('');
}

export function vigenereEncrypt(text: string, key: string): string {
  if (!key) return text;
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) return text;

  let keyIdx = 0;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const base = isUpper ? 65 : 97;
    const shift = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
    keyIdx++;
    return String.fromCharCode(((code - base + shift) % 26) + base);
  });
}

export function vigenereDecrypt(text: string, key: string): string {
  if (!key) return text;
  const cleanKey = key.toUpperCase().replace(/[^A-Z]/g, '');
  if (!cleanKey) return text;

  let keyIdx = 0;
  return text.replace(/[a-zA-Z]/g, (char) => {
    const code = char.charCodeAt(0);
    const isUpper = code >= 65 && code <= 90;
    const base = isUpper ? 65 : 97;
    const shift = cleanKey.charCodeAt(keyIdx % cleanKey.length) - 65;
    keyIdx++;
    return String.fromCharCode(((code - base - shift + 26) % 26) + base);
  });
}

export function xorEncryptHex(text: string, key: string): string {
  if (!key) return '';
  const result: string[] = [];
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result.push(charCode.toString(16).padStart(2, '0'));
  }
  return result.join('');
}

export function xorDecryptHex(hex: string, key: string): string {
  if (!key || hex.length % 2 !== 0) return '';
  let result = '';
  for (let i = 0; i < hex.length; i += 2) {
    const byte = parseInt(hex.substring(i, i + 2), 16);
    const charCode = byte ^ key.charCodeAt((i / 2) % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}
