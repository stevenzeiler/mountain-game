import * as THREE from 'three';
import { Tree } from './Tree';
import { GameEntity } from '../game/types';
import { GAME_CONFIG } from '../game/config';

export class TreeManager implements GameEntity {
  public mesh: THREE.Group;
  private trees: Tree[] = [];
  private density: number;
  private readonly FORCE_FIELD_CLEARANCE = 50; // Minimum distance from force field

  constructor(density: number = 0.0001) {
    this.density = density;
    this.mesh = new THREE.Group();
    this.generateTrees();
  }

  private generateTrees(): void {
    const { CHUNK_SIZE, RENDER_DISTANCE } = GAME_CONFIG.WORLD;
    const worldWidth = CHUNK_SIZE * RENDER_DISTANCE.X * 2;
    const worldDepth = CHUNK_SIZE * RENDER_DISTANCE.Z * 2;
    
    // Calculate number of trees based on world size and density
    const numTrees = Math.floor(worldWidth * worldDepth * this.density);
    
    for (let i = 0; i < numTrees; i++) {
      // Generate random position within world bounds
      const x = (Math.random() - 0.5) * worldWidth;
      const z = (Math.random() - 0.5) * worldDepth;
      
      // Skip if too close to force field
      if (Math.abs(x) < this.FORCE_FIELD_CLEARANCE) {
        continue;
      }
      
      const position = new THREE.Vector3(x, 0, z);
      const tree = new Tree(position);
      
      this.trees.push(tree);
      this.mesh.add(tree.mesh);
    }
  }

  update(deltaTime: number): void {
    // Update all trees (for wind animation)
    this.trees.forEach(tree => tree.update(deltaTime));
  }

  // Get tree positions for collision detection
  getTreePositions(): THREE.Vector3[] {
    return this.trees.map(tree => tree.mesh.position);
  }
} 