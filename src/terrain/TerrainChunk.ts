import * as THREE from 'three';
import { GameEntity } from '../game/types';
import { TerrainGenerator } from './TerrainGenerator';
import { River } from '../environment/River';

export class TerrainChunk implements GameEntity {
  public mesh: THREE.Group;
  private generator: TerrainGenerator;
  private position: THREE.Vector3;
  private size: number;

  constructor(position: THREE.Vector3, size: number, flatMode: boolean = false, river?: River) {
    this.mesh = new THREE.Group();
    this.position = position;
    this.size = size;
    
    this.generator = new TerrainGenerator(
      position.x * 10000 + position.z,
      flatMode,
      river
    );

    this.generateMesh();
  }

  private generateMesh(): void {
    const geometry = new THREE.PlaneGeometry(
      this.size,
      this.size,
      16,
      16
    );

    const positions = geometry.attributes.position.array;
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i] + this.position.x;
      const z = positions[i + 2] + this.position.z;
      positions[i + 1] = this.generator.getHeight(x, z);
    }

    geometry.computeVertexNormals();

    // Create a simple material first to test visibility
    const simpleMaterial = new THREE.MeshStandardMaterial({
      color: 0xd2b48c, // Light tan/brown
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });

    const ground = new THREE.Mesh(geometry, simpleMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.castShadow = true;

    // Clear any existing meshes
    while (this.mesh.children.length > 0) {
      this.mesh.remove(this.mesh.children[0]);
    }
    
    this.mesh.add(ground);

    // After confirming basic visibility, create and apply the grid texture
    const gridSize = 512;
    const canvas = document.createElement('canvas');
    canvas.width = gridSize;
    canvas.height = gridSize;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Fill with light brown base color
      ctx.fillStyle = '#d2b48c';
      ctx.fillRect(0, 0, gridSize, gridSize);

      // Draw grid with slightly darker brown
      ctx.strokeStyle = '#bc9d7e';
      ctx.lineWidth = 2;
      const cellSize = 32;

      for (let i = 0; i <= gridSize; i += cellSize) {
        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, gridSize);
        ctx.stroke();

        // Draw horizontal line
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(gridSize, i);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, 4);
      texture.needsUpdate = true;

      // Update the material with the texture
      ground.material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
        color: 0xffffff // Use white color to let texture show through
      });
      ground.material.needsUpdate = true;
    }
  }

  // Optional: Add methods for LOD (Level of Detail) if needed
  setLOD(_level: number): void {
    // TODO: Implement LOD system
  }

  update(_deltaTime: number): void {
    // No update needed for static terrain
  }
} 