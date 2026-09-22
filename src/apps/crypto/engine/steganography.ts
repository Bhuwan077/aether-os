/**
 * LSB (Least Significant Bit) Image Steganography Engine
 * Operates on RGBA pixel byte arrays.
 */

export interface PixelBuffer {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export function getMaxStegoCapacity(width: number, height: number): number {
  // We use RGB channels (3 bits per pixel). 32 bits reserved for length header.
  const totalUsableBits = width * height * 3;
  if (totalUsableBits <= 32) return 0;
  return Math.floor((totalUsableBits - 32) / 8);
}

export function encodeMessageInImageData(buffer: PixelBuffer, message: string): boolean {
  const encoder = new TextEncoder();
  const msgBytes = encoder.encode(message);
  const msgLen = msgBytes.length;

  const maxBytes = getMaxStegoCapacity(buffer.width, buffer.height);
  if (msgLen > maxBytes) {
    return false; // Not enough capacity
  }

  // Header: 32-bit big endian length
  const bits: number[] = [];
  for (let b = 31; b >= 0; b--) {
    bits.push((msgLen >>> b) & 1);
  }

  // Message bits
  for (let i = 0; i < msgBytes.length; i++) {
    const byte = msgBytes[i];
    for (let b = 7; b >= 0; b--) {
      bits.push((byte >>> b) & 1);
    }
  }

  let bitIdx = 0;
  const totalPixels = buffer.width * buffer.height;

  for (let p = 0; p < totalPixels && bitIdx < bits.length; p++) {
    const offset = p * 4;
    // Modify R, G, B channels, leave A (offset + 3) untouched
    for (let c = 0; c < 3 && bitIdx < bits.length; c++) {
      buffer.data[offset + c] = (buffer.data[offset + c] & ~1) | bits[bitIdx++];
    }
  }

  return true;
}

export function decodeMessageFromImageData(buffer: PixelBuffer): string | null {
  const totalPixels = buffer.width * buffer.height;
  const totalUsableBits = totalPixels * 3;
  if (totalUsableBits < 32) return null;

  // Extract first 32 bits for length
  let bitIdx = 0;
  let msgLen = 0;

  for (let p = 0; p < totalPixels && bitIdx < 32; p++) {
    const offset = p * 4;
    for (let c = 0; c < 3 && bitIdx < 32; c++) {
      const bit = buffer.data[offset + c] & 1;
      msgLen = (msgLen << 1) | bit;
      bitIdx++;
    }
  }

  const maxCapacity = getMaxStegoCapacity(buffer.width, buffer.height);
  if (msgLen <= 0 || msgLen > maxCapacity) {
    return null; // Invalid or no embedded message
  }

  const targetBits = 32 + msgLen * 8;
  if (totalUsableBits < targetBits) return null;

  const msgBytes = new Uint8Array(msgLen);
  let currentByte = 0;
  let currentBitInByte = 0;
  let byteIdx = 0;

  bitIdx = 0;
  for (let p = 0; p < totalPixels && byteIdx < msgLen; p++) {
    const offset = p * 4;
    for (let c = 0; c < 3 && byteIdx < msgLen; c++) {
      if (bitIdx >= 32) {
        const bit = buffer.data[offset + c] & 1;
        currentByte = (currentByte << 1) | bit;
        currentBitInByte++;
        if (currentBitInByte === 8) {
          msgBytes[byteIdx++] = currentByte;
          currentByte = 0;
          currentBitInByte = 0;
        }
      }
      bitIdx++;
    }
  }

  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(msgBytes);
  } catch {
    return null;
  }
}

export function generateSyntheticCarrier(
  width: number,
  height: number,
  pattern: 'gradient' | 'noise' | 'cyber' = 'cyber'
): Uint8ClampedArray {
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      if (pattern === 'gradient') {
        data[idx] = Math.floor((x / width) * 255); // R
        data[idx + 1] = Math.floor((y / height) * 255); // G
        data[idx + 2] = 180; // B
      } else if (pattern === 'noise') {
        const val = Math.floor(Math.random() * 256);
        data[idx] = val;
        data[idx + 1] = val;
        data[idx + 2] = val;
      } else {
        // Cyber grid
        const isGrid = x % 16 === 0 || y % 16 === 0;
        data[idx] = isGrid ? 0 : 15; // R
        data[idx + 1] = isGrid ? 240 : 40; // G
        data[idx + 2] = isGrid ? 255 : 70; // B
      }
      data[idx + 3] = 255; // Alpha
    }
  }

  return data;
}
