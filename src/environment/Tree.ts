import * as THREE from 'three';
import { GameEntity } from '../game/types';

export class Tree implements GameEntity {
  public mesh: THREE.Group;
  private position: THREE.Vector3;

  constructor(position: THREE.Vector3) {
    this.position = position;
    this.mesh = this.generateTree();
  }

  private generateTree(): THREE.Group {
    const tree = new THREE.Group();

    // Create trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 6);
    const trunkMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a3728,
      roughness: 0.8,
      metalness: 0.2
    });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1;
    trunk.castShadow = true;
    trunk.receiveShadow = true;

    // Create foliage (low-poly style)
    const foliageGeometry = new THREE.ConeGeometry(1, 2, 6);
    const foliageMaterial = new THREE.MeshStandardMaterial({
      color: 0x2d5a27,
      roughness: 0.8,
      metalness: 0.1
    });
    
    // Create multiple layers of foliage
    const foliageLayers = [
      { y: 2.5, scale: 1 },
      { y: 3, scale: 0.8 },
      { y: 3.5, scale: 0.6 }
    ];

    foliageLayers.forEach(layer => {
      const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
      foliage.position.y = layer.y;
      foliage.scale.set(layer.scale, layer.scale, layer.scale);
      foliage.castShadow = true;
      foliage.receiveShadow = true;
      tree.add(foliage);
    });

    tree.add(trunk);
    tree.position.copy(this.position);

    // Add some random rotation for variety
    tree.rotation.y = Math.random() * Math.PI * 2;
    
    return tree;
  }

  update(_deltaTime: number): void {
    // Add gentle wind movement
    const time = Date.now() * 0.001;
    const windStrength = 0.02;
    this.mesh.rotation.z = Math.sin(time) * windStrength;
  }
} 