import { DataPoint } from './types';

export function generateCircleData(count = 120, noise = 0.05): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const isInner = Math.random() < 0.5;
    const r = isInner ? Math.random() * 0.45 : 0.65 + Math.random() * 0.45;
    const theta = Math.random() * Math.PI * 2;
    const x = r * Math.cos(theta) + (Math.random() - 0.5) * noise;
    const y = r * Math.sin(theta) + (Math.random() - 0.5) * noise;
    points.push({ x, y, label: isInner ? 1 : 0 });
  }
  return points;
}

export function generateXorData(count = 120, noise = 0.05): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    let x = (Math.random() * 2 - 1) * 0.9;
    let y = (Math.random() * 2 - 1) * 0.9;
    const label = (x > 0 && y > 0) || (x < 0 && y < 0) ? 1 : 0;
    x += (Math.random() - 0.5) * noise;
    y += (Math.random() - 0.5) * noise;
    points.push({ x, y, label });
  }
  return points;
}

export function generateSpiralData(count = 120): DataPoint[] {
  const points: DataPoint[] = [];
  const half = Math.floor(count / 2);

  for (let i = 0; i < half; i++) {
    const r = (i / half) * 0.95;
    const t = 1.75 * i * 0.15;
    points.push({ x: r * Math.sin(t), y: r * Math.cos(t), label: 1 });
    points.push({ x: -r * Math.sin(t), y: -r * Math.cos(t), label: 0 });
  }
  return points;
}

export function generateGaussianClusters(count = 120): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < count; i++) {
    const isCluster1 = Math.random() < 0.5;
    const cx = isCluster1 ? 0.5 : -0.5;
    const cy = isCluster1 ? 0.5 : -0.5;
    const x = cx + (Math.random() - 0.5) * 0.6;
    const y = cy + (Math.random() - 0.5) * 0.6;
    points.push({ x, y, label: isCluster1 ? 1 : 0 });
  }
  return points;
}
