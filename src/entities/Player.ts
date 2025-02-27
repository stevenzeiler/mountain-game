import * as THREE from 'three';
import { GameEntity, ControlState, WorldBounds } from '../game/types';
import { Controls } from '../controls/Controls';
import { GAME_CONFIG } from '../game/config';

export class Player implements GameEntity {
  public mesh: THREE.Mesh;
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private rotation: number;
  private controls: Controls;
  private obstacles: THREE.Object3D[];
  private worldBounds: WorldBounds;

  constructor(controls: Controls) {
    this.controls = controls;
    this.position = new THREE.Vector3(0, 1, 0);
    this.velocity = new THREE.Vector3();
    this.rotation = 0;
    this.obstacles = [];

    // Set world boundaries
    const { CHUNK_SIZE, RENDER_DISTANCE } = GAME_CONFIG.WORLD;
    this.worldBounds = {
      minX: -RENDER_DISTANCE.X * CHUNK_SIZE,
      maxX: RENDER_DISTANCE.X * CHUNK_SIZE,
      minZ: -RENDER_DISTANCE.Z * CHUNK_SIZE,
      maxZ: RENDER_DISTANCE.Z * CHUNK_SIZE
    };

    // Create player mesh
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(this.position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;

    // Set up mouse controls
    this.setupMouseControls();
  }

  private setupMouseControls(): void {
    // Lock pointer when clicking on the game
    document.addEventListener('click', () => {
      document.body.requestPointerLock();
    });
    
    // Handle mouse movement
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement) {
        this.rotation -= event.movementX * GAME_CONFIG.PLAYER.MOUSE_SENSITIVITY;
      }
    });
  }

  update(deltaTime: number): void {
    const controlState = this.controls.getState();
    const speed = controlState.sprint ? 
      GAME_CONFIG.PLAYER.SPRINT_SPEED : 
      GAME_CONFIG.PLAYER.SPEED;

    // Calculate movement direction relative to player's rotation
    const direction = this.calculateMoveDirection(controlState);
    
    // Apply movement
    if (direction.length() > 0) {
      direction.normalize();
      const rotatedDirection = direction.clone()
        .applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      
      // Update velocity with smoother acceleration
      this.velocity.x += (rotatedDirection.x * speed - this.velocity.x) * 0.1;
      this.velocity.z += (rotatedDirection.z * speed - this.velocity.z) * 0.1;
    } else {
      // Apply smooth deceleration
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }

    // Handle keyboard turning
    if (controlState.turnLeft) this.rotation += 0.03;
    if (controlState.turnRight) this.rotation -= 0.03;

    // Apply gravity and jumping
    if (controlState.jump && this.position.y <= 0.6) {
      this.velocity.y = 4;
    }
    this.velocity.y -= 0.15; // Gravity

    // Calculate new position
    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x * deltaTime;
    newPosition.y += this.velocity.y * deltaTime;
    newPosition.z += this.velocity.z * deltaTime;

    // Apply world boundaries
    newPosition.x = Math.max(
      this.worldBounds.minX + GAME_CONFIG.WORLD.BARRIER_DEPTH,
      Math.min(this.worldBounds.maxX - GAME_CONFIG.WORLD.BARRIER_DEPTH, newPosition.x)
    );
    newPosition.z = Math.max(
      this.worldBounds.minZ + GAME_CONFIG.WORLD.BARRIER_DEPTH,
      Math.min(this.worldBounds.maxZ - GAME_CONFIG.WORLD.BARRIER_DEPTH, newPosition.z)
    );

    // Ground collision
    if (newPosition.y < 0.5) {
      newPosition.y = 0.5;
      this.velocity.y = 0;
    }

    // Check obstacle collisions
    if (!this.checkObstacleCollision(newPosition)) {
      this.position.copy(newPosition);
    }

    // Update mesh position and rotation
    this.mesh.position.copy(this.position);
    this.mesh.rotation.y = this.rotation;
  }

  private calculateMoveDirection(controlState: ControlState): THREE.Vector3 {
    const direction = new THREE.Vector3();
    
    if (controlState.forward) direction.z -= 1;
    if (controlState.backward) direction.z += 1;
    if (controlState.left) direction.x -= 1;
    if (controlState.right) direction.x += 1;

    return direction;
  }

  private checkObstacleCollision(position: THREE.Vector3): boolean {
    const playerRadius = 0.5;
    
    for (const obstacle of this.obstacles) {
      const obstaclePosition = obstacle.position.clone();
      const obstacleRadius = 0.7; // Assuming standard obstacle size
      
      const dx = position.x - obstaclePosition.x;
      const dz = position.z - obstaclePosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance < (playerRadius + obstacleRadius)) {
        return true;
      }
    }
    
    return false;
  }

  registerObstacle(obstacle: THREE.Object3D): void {
    this.obstacles.push(obstacle);
  }

  getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  getRotation(): number {
    return this.rotation;
  }
} 