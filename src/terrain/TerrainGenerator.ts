import * as THREE from 'three';
import { River } from '../environment/River';

export class TerrainGenerator {
  private seed: number;
  private river?: River;
  private flatMode: boolean;

  constructor(seed: number = Math.random(), flatMode: boolean = false, river?: River) {
    this.seed = seed;
    this.flatMode = flatMode;
    this.river = river;
  }

  private seededRandom(x: number, z: number): number {
    const dot = x * 12.9898 + z * 78.233 + this.seed;
    const sin = Math.sin(dot) * 43758.5453123;
    return sin - Math.floor(sin);
  }

  private smoothNoise(x: number, z: number): number {
    const corners = (
      this.seededRandom(Math.floor(x - 1), Math.floor(z - 1)) +
      this.seededRandom(Math.floor(x + 1), Math.floor(z - 1)) +
      this.seededRandom(Math.floor(x - 1), Math.floor(z + 1)) +
      this.seededRandom(Math.floor(x + 1), Math.floor(z + 1))
    ) / 16;
    
    const sides = (
      this.seededRandom(Math.floor(x), Math.floor(z - 1)) +
      this.seededRandom(Math.floor(x - 1), Math.floor(z)) +
      this.seededRandom(Math.floor(x + 1), Math.floor(z)) +
      this.seededRandom(Math.floor(x), Math.floor(z + 1))
    ) / 8;
    
    const center = this.seededRandom(Math.floor(x), Math.floor(z)) / 4;
    
    return corners + sides + center;
  }

  private getDistanceToRiver(x: number, z: number): number {
    if (!this.river) return Infinity;

    const riverPoints = this.river.curve.getPoints(20); // Reduced from 100
    let minDistance = Infinity;

    for (let i = 0; i < riverPoints.length - 1; i++) {
      const start = riverPoints[i];
      const end = riverPoints[i + 1];
      
      const line = end.clone().sub(start);
      const len = line.length();
      line.normalize();
      
      const point = new THREE.Vector3(x, 0, z);
      const pointToStart = point.clone().sub(start);
      
      const t = Math.max(0, Math.min(len, pointToStart.dot(line)));
      const projection = start.clone().add(line.multiplyScalar(t));
      
      const distance = point.distanceTo(projection);
      minDistance = Math.min(minDistance, distance);
    }

    return minDistance;
  }

  public getHeight(x: number, z: number): number {
    if (this.flatMode) return 0;

    // Simplified terrain generation
    const scale = 0.01;
    const height = this.smoothNoise(x * scale, z * scale) * 20;

    // Simplified valley effect
    const riverDistance = this.getDistanceToRiver(x, z);
    const valleyWidth = 100;
    
    if (riverDistance < valleyWidth) {
      const t = riverDistance / valleyWidth;
      return height * t - 2; // -2 is river depth
    }

    return height;
  }
} 