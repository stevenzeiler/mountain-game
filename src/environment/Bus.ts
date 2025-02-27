import * as THREE from 'three';
import { GameEntity } from '../game/types';
import { Road } from './Road';

export class Bus implements GameEntity {
  public mesh: THREE.Group;
  private road: Road;
  private progress: number = 0;
  private speed: number = 0.1;
  private wheelMeshes: THREE.Mesh[] = [];

  constructor(road: Road) {
    this.road = road;
    this.mesh = new THREE.Group();
    this.createBus();
    this.positionOnRoad();
  }

  private createBus(): void {
    // Create bus body
    const bodyGeometry = new THREE.BoxGeometry(4, 3, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      roughness: 0.2,
      metalness: 0.8
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 2;
    body.castShadow = true;
    body.receiveShadow = true;

    // Create windows
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.7
    });

    // Side windows
    [-1, 1].forEach(side => {
      const windowGeometry = new THREE.BoxGeometry(0.1, 1.5, 6);
      const window = new THREE.Mesh(windowGeometry, windowMaterial);
      window.position.set(side * 2, 2.5, 0);
      body.add(window);
    });

    // Windshield
    const windshieldGeometry = new THREE.BoxGeometry(3.8, 1.5, 0.1);
    const windshield = new THREE.Mesh(windshieldGeometry, windowMaterial);
    windshield.position.set(0, 2.5, 3.9);
    body.add(windshield);

    // Create wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.5, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1a1a1a,
      roughness: 0.8,
      metalness: 0.2
    });

    // Add wheels at each corner
    const wheelPositions = [
      { x: -1.8, z: 2.5 },
      { x: 1.8, z: 2.5 },
      { x: -1.8, z: -2.5 },
      { x: 1.8, z: -2.5 }
    ];

    wheelPositions.forEach(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.position.set(pos.x, 0.7, pos.z);
      wheel.rotation.z = Math.PI / 2;
      wheel.castShadow = true;
      this.wheelMeshes.push(wheel);
      this.mesh.add(wheel);
    });

    // Add headlights
    const headlightGeometry = new THREE.CircleGeometry(0.3, 16);
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffcc,
      emissive: 0xffffcc,
      emissiveIntensity: 0.5
    });

    [-1, 1].forEach(side => {
      const headlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
      headlight.position.set(side * 1.5, 1.5, 4);
      body.add(headlight);
    });

    this.mesh.add(body);
  }

  private positionOnRoad(): void {
    const point = this.road.curve.getPoint(this.progress);
    const lookAtPoint = this.road.curve.getPoint(
      (this.progress + 0.01) % 1
    );
    
    this.mesh.position.copy(point);
    this.mesh.position.y = 0.7; // Adjust for wheel height
    this.mesh.lookAt(lookAtPoint);
  }

  update(deltaTime: number): void {
    // Update progress along the road
    this.progress = (this.progress + this.speed * deltaTime) % 1;
    
    // Update position and rotation
    this.positionOnRoad();

    // Rotate wheels
    const wheelRotationSpeed = 2;
    this.wheelMeshes.forEach(wheel => {
      wheel.rotation.x += wheelRotationSpeed * deltaTime;
    });
  }
} 