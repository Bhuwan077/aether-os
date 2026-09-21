import { describe, it, expect } from 'vitest';

export function evaluateQuickMath(expr: string): number | null {
  const sanitized = expr.trim().replace(/\^/g, '**').replace(/x/g, '*');
  if (!/^[0-9+\-*/().\s*]+$/.test(sanitized)) {
    return null;
  }
  try {
    const res = Function(`"use strict"; return (${sanitized});`)();
    return typeof res === 'number' && !isNaN(res) ? res : null;
  } catch {
    return null;
  }
}

describe('Command Palette Quick Calculator', () => {
  it('should evaluate simple math expressions', () => {
    expect(evaluateQuickMath('2 + 2')).toBe(4);
    expect(evaluateQuickMath('10 * 5')).toBe(50);
    expect(evaluateQuickMath('(12 + 8) / 4')).toBe(5);
  });

  it('should evaluate exponent expressions', () => {
    expect(evaluateQuickMath('2^8')).toBe(256);
  });

  it('should return null for non-math strings', () => {
    expect(evaluateQuickMath('retroterm')).toBeNull();
    expect(evaluateQuickMath('alert(1)')).toBeNull();
    expect(evaluateQuickMath('')).toBeNull();
  });
});
