import * as THREE from 'three';
import { GameEntity } from '../game/types';

export class Scene {
  private scene: THREE.Scene;
  private entities: Map<string, GameEntity>;
  private lights: THREE.Light[];

  constructor() {
    this.scene = new THREE.Scene();
    this.entities = new Map();
    this.lights = [];
    this.setupLighting();
    this.setupSky();
  }

  private setupLighting(): void {
    // Reduced ambient light for darker overall scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    
    // Main directional light (sun) with reduced intensity
    const sunLight = new THREE.DirectionalLight(0xffffff, 0.7);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;

    // Optimize shadow map
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -200;
    sunLight.shadow.camera.right = 200;
    sunLight.shadow.camera.top = 200;
    sunLight.shadow.camera.bottom = -200;

    // Secondary directional light for fill with reduced intensity
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.2);
    fillLight.position.set(-50, 50, -50);

    // Hemisphere light for sky/ground ambient with reduced intensity
    const hemiLight = new THREE.HemisphereLight(
      0x90c5e7, // Sky blue
      0xd2b48c, // Light brown (matching ground)
      0.3
    );
    
    this.lights = [ambientLight, sunLight, fillLight, hemiLight];
    this.lights.forEach(light => this.scene.add(light));
  }

  private setupSky(): void {
    // Set sky gradient
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, 512);
      gradient.addColorStop(0, '#1e90ff'); // Dodger blue at top
      gradient.addColorStop(0.5, '#87ceeb'); // Sky blue at horizon
      context.fillStyle = gradient;
      context.fillRect(0, 0, 2, 512);
      
      const skyTexture = new THREE.CanvasTexture(canvas);
      skyTexture.wrapS = THREE.RepeatWrapping;
      skyTexture.wrapT = THREE.ClampToEdgeWrapping;
      skyTexture.repeat.set(2, 1);
      
      // Create sky dome
      const skyGeo = new THREE.SphereGeometry(1000, 32, 32);
      const skyMat = new THREE.MeshBasicMaterial({
        map: skyTexture,
        side: THREE.BackSide,
        fog: false
      });
      const sky = new THREE.Mesh(skyGeo, skyMat);
      this.scene.add(sky);
    }
  }

  update(deltaTime: number): void {
    this.entities.forEach(entity => {
      if (entity.update) {
        entity.update(deltaTime);
      }
    });
  }

  addEntity(id: string, entity: GameEntity): void {
    this.entities.set(id, entity);
    this.scene.add(entity.mesh);
  }

  removeEntity(id: string): void {
    const entity = this.entities.get(id);
    if (entity) {
      this.scene.remove(entity.mesh);
      this.entities.delete(id);
    }
  }

  getEntity(id: string): GameEntity | undefined {
    return this.entities.get(id);
  }

  getThreeScene(): THREE.Scene {
    return this.scene;
  }

  clear(): void {
    this.entities.forEach((_, id) => this.removeEntity(id));
    this.lights.forEach(light => this.scene.remove(light));
    this.lights = [];
    this.setupLighting();
    this.setupSky();
  }
} 