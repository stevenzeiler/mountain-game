import * as THREE from 'three';
import { GAME_CONFIG } from '../game/config';

export class Camera {
  private camera: THREE.PerspectiveCamera;
  private target: THREE.Vector3;
  private currentPosition: THREE.Vector3;
  private offset: THREE.Vector3;

  constructor() {
    this.camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );

    this.target = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.offset = new THREE.Vector3(
      GAME_CONFIG.PLAYER.CAMERA_OFFSET.x,
      GAME_CONFIG.PLAYER.CAMERA_OFFSET.y,
      GAME_CONFIG.PLAYER.CAMERA_OFFSET.z
    );

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  update(playerPosition: THREE.Vector3, playerRotation: number): void {
    // Update target to be slightly above player
    this.target.copy(playerPosition).add(new THREE.Vector3(0, 1, 0));

    // Calculate ideal camera position based on player rotation
    const rotatedOffset = this.offset.clone()
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), playerRotation);
    
    const idealPosition = playerPosition.clone().add(rotatedOffset);

    // Smoothly interpolate current camera position
    this.currentPosition.lerp(
      idealPosition,
      GAME_CONFIG.PLAYER.CAMERA_SMOOTH_FACTOR
    );

    // Update camera position and look at target
    this.camera.position.copy(this.currentPosition);
    this.camera.lookAt(this.target);
  }

  handleResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }

  getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
  }
} 