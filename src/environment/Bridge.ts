import * as THREE from 'three';
import { GameEntity } from '../game/types';

export class Bridge implements GameEntity {
  public mesh: THREE.Group;
  public collisionMesh: THREE.Object3D;

  constructor(start: THREE.Vector3, end: THREE.Vector3, width: number = 15) {
    this.mesh = new THREE.Group();
    
    // Calculate bridge dimensions and direction
    const direction = end.clone().sub(start).normalize();
    const length = start.distanceTo(end);
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
    const bridgeHeight = 5;
    const archHeight = 3;
    
    // Create stone material
    const stoneMaterial = new THREE.MeshStandardMaterial({
      color: 0x7f7f7f,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    // Create bridge deck (road surface)
    const deckGeometry = new THREE.PlaneGeometry(width, length);
    const deck = new THREE.Mesh(deckGeometry, stoneMaterial);
    deck.position.copy(start).add(end).multiplyScalar(0.5);
    deck.position.y = bridgeHeight;
    deck.lookAt(end);
    deck.rotateX(Math.PI / 2);
    deck.receiveShadow = true;
    deck.castShadow = true;
    this.mesh.add(deck);

    // Create arch
    const archSegments = 8;
    const archPoints = [];
    for (let i = 0; i <= archSegments; i++) {
      const t = i / archSegments;
      const x = t * length;
      const y = Math.sin(t * Math.PI) * archHeight;
      archPoints.push(new THREE.Vector2(x, y));
    }
    
    const archShape = new THREE.Shape();
    archShape.moveTo(-0.5, 0);
    archShape.lineTo(-0.5, 2);
    archShape.lineTo(0.5, 2);
    archShape.lineTo(0.5, 0);

    const archGeometry = new THREE.ExtrudeGeometry(archShape, {
      steps: archSegments,
      bevelEnabled: false,
      extrudePath: new THREE.CatmullRomCurve3(
        archPoints.map(p => new THREE.Vector3(p.x, p.y, 0))
      )
    });

    // Create two arches, one on each side of the bridge
    [-1, 1].forEach(side => {
      const arch = new THREE.Mesh(archGeometry, stoneMaterial);
      arch.position.copy(start);
      arch.position.add(perpendicular.clone().multiplyScalar(width * 0.4 * side));
      arch.lookAt(end);
      arch.castShadow = true;
      arch.receiveShadow = true;
      this.mesh.add(arch);
    });

    // Create stone railings
    [-1, 1].forEach(side => {
      const railingGeometry = new THREE.BoxGeometry(length, 1, 0.5);
      const railing = new THREE.Mesh(railingGeometry, stoneMaterial);
      railing.position.copy(deck.position);
      railing.position.y += 0.5;
      railing.position.add(perpendicular.clone().multiplyScalar(width * 0.45 * side));
      railing.lookAt(end);
      railing.castShadow = true;
      railing.receiveShadow = true;
      this.mesh.add(railing);

      // Add railing posts
      const postCount = Math.floor(length / 2);
      for (let i = 0; i <= postCount; i++) {
        const post = new THREE.Mesh(
          new THREE.BoxGeometry(0.4, 1.5, 0.4),
          stoneMaterial
        );
        const t = i / postCount;
        const postPos = start.clone().lerp(end, t);
        post.position.copy(postPos);
        post.position.y = bridgeHeight + 0.75;
        post.position.add(perpendicular.clone().multiplyScalar(width * 0.45 * side));
        post.castShadow = true;
        post.receiveShadow = true;
        this.mesh.add(post);
      }
    });

    // Create collision mesh for the bridge deck
    const collisionGeometry = new THREE.BoxGeometry(width, 0.1, length);
    this.collisionMesh = new THREE.Mesh(collisionGeometry);
    this.collisionMesh.position.copy(deck.position);
    this.collisionMesh.lookAt(end);
    this.collisionMesh.visible = false;
  }

  update(_deltaTime: number): void {
    // No update needed for static bridge
  }
} 