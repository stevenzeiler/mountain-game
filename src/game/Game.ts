import * as THREE from 'three';
import { Scene } from '../core/Scene';
import { Camera } from '../core/Camera';
import { Renderer } from '../core/Renderer';
import { ForceField } from '../effects/ForceField';
import { Player } from '../entities/Player';
import { Controls } from '../controls/Controls';
import { TerrainChunk } from '../terrain/TerrainChunk';
import { TreeManager } from '../environment/TreeManager';
import { River } from '../environment/River';
import { Road } from '../environment/Road';
import { Bus } from '../environment/Bus';
import { GAME_CONFIG } from './config';

export class Game {
  private scene: Scene;
  private camera: Camera;
  private renderer: Renderer;
  private player: Player;
  private controls: Controls;
  private forceField: ForceField;
  private terrain: TerrainChunk[] = [];
  private treeManager: TreeManager = new TreeManager(0.0001);
  private river: River = new River();
  private road!: Road;
  private bus!: Bus;
  private lastTime: number = 0;
  private isRunning: boolean = false;

  constructor() {
    // Initialize core systems
    this.scene = new Scene();
    this.camera = new Camera();
    this.renderer = new Renderer();
    this.controls = new Controls();

    // Initialize game entities
    this.player = new Player(this.controls);
    this.scene.addEntity('player', this.player);

    // Initialize force field
    this.forceField = new ForceField(
      GAME_CONFIG.WORLD.SIZE * 4,
      GAME_CONFIG.FORCE_FIELD.HEIGHT
    );
    this.forceField.mesh.position.x = 0;
    this.forceField.mesh.position.y = GAME_CONFIG.FORCE_FIELD.HEIGHT / 2;
    this.forceField.mesh.position.z = 0;
    this.scene.addEntity('forceField', this.forceField);

    // Initialize terrain and environment
    this.initializeTerrain();
    this.initializeEnvironment();

    // Start game loop
    this.isRunning = true;
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  private initializeTerrain(): void {
    const { CHUNK_SIZE, RENDER_DISTANCE } = GAME_CONFIG.WORLD;

    // Generate terrain chunks
    for (let x = -RENDER_DISTANCE.X; x <= RENDER_DISTANCE.X; x++) {
      for (let z = -RENDER_DISTANCE.Z; z <= RENDER_DISTANCE.Z; z++) {
        const position = new THREE.Vector3(
          x * CHUNK_SIZE,
          0,
          z * CHUNK_SIZE
        );

        const chunk = new TerrainChunk(position, CHUNK_SIZE, false, this.river);
        this.terrain.push(chunk);
        this.scene.addEntity(`terrain_${x}_${z}`, chunk);
      }
    }
  }

  private initializeEnvironment(): void {
    // Add trees to scene
    this.scene.addEntity('trees', this.treeManager);

    // Register trees as obstacles for player collision
    this.treeManager.getTreePositions().forEach(position => {
      const obstacle = new THREE.Object3D();
      obstacle.position.copy(position);
      this.player.registerObstacle(obstacle);
    });

    // Add river to scene
    this.scene.addEntity('river', this.river);

    // Create solid barriers along the river
    const riverPoints = this.river.curve.getPoints(100);
    for (let i = 0; i < riverPoints.length - 1; i++) {
      const current = riverPoints[i];
      const next = riverPoints[i + 1];
      const direction = next.clone().sub(current).normalize();
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
      const barrierLength = current.distanceTo(next);
      
      // Create dense barrier of collision points
      const numBarriers = Math.ceil(barrierLength / 2); // One barrier every 2 units for tighter collision
      for (let j = 0; j <= numBarriers; j++) {
        const t = j / numBarriers;
        const pos = current.clone().lerp(next, t);
        
        // Create barriers only at the river edges (10 units from center, which is the river width/2)
        [-1, 1].forEach(side => {
          const barrier = new THREE.Object3D();
          barrier.position.copy(pos)
            .add(perpendicular.clone().multiplyScalar(10 * side));
          this.player.registerObstacle(barrier);
        });
      }
    }

    // Add road and bridges to scene
    this.road = new Road(15, this.river);
    this.scene.addEntity('road', this.road);

    // Register bridge collision meshes
    this.road.bridges.forEach(bridge => {
      this.player.registerObstacle(bridge.collisionMesh);
    });

    // Add bus to scene
    this.bus = new Bus(this.road);
    this.scene.addEntity('bus', this.bus);
  }

  private animate(time: number): void {
    if (!this.isRunning) return;

    requestAnimationFrame(this.animate);

    const deltaTime = (time - this.lastTime) * 0.001;
    this.lastTime = time;

    // Update all entities
    this.scene.update(deltaTime);

    // Update camera based on player position
    this.camera.update(
      this.player.getPosition(),
      this.player.getRotation()
    );

    // Render the scene
    this.renderer.render(
      this.scene.getThreeScene(),
      this.camera.getCamera()
    );
  }

  public destroy(): void {
    this.isRunning = false;
    this.camera.destroy();
    this.renderer.destroy();
    this.controls.destroy();
  }
} 