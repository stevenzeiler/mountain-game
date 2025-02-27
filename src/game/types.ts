import * as THREE from 'three';

export type WorldType = 'main' | 'second';

export interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export interface TunnelBounds {
  entrance: THREE.Box3;
  exit: THREE.Box3;
}

export interface GameEntity {
  mesh: THREE.Object3D | THREE.Group;
  update?(deltaTime: number): void;
} 