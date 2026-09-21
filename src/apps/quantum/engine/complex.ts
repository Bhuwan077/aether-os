export interface Complex {
  re: number;
  im: number;
}

export function c(re: number, im = 0): Complex {
  return { re, im };
}

export function cAdd(a: Complex, b: Complex): Complex {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cSub(a: Complex, b: Complex): Complex {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function cMul(a: Complex, b: Complex): Complex {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cScale(a: Complex, factor: number): Complex {
  return { re: a.re * factor, im: a.im * factor };
}

export function cMagSq(a: Complex): number {
  return a.re * a.re + a.im * a.im;
}

export function cMag(a: Complex): number {
  return Math.sqrt(cMagSq(a));
}

export function cPhase(a: Complex): number {
  return Math.atan2(a.im, a.re);
}

export function cFormat(a: Complex): string {
  const reStr = a.re.toFixed(3);
  const imStr = Math.abs(a.im).toFixed(3);
  if (Math.abs(a.im) < 0.001) return reStr;
  if (Math.abs(a.re) < 0.001) return `${a.im >= 0 ? '' : '-'}${imStr}i`;
  return `${reStr} ${a.im >= 0 ? '+' : '-'} ${imStr}i`;
}
