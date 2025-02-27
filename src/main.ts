import * as THREE from 'three';
import { TerrainGenerator } from './TerrainGenerator';

class Game {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private terrain: TerrainChunk[];
  private player: Player;
  private controls: Controls;
  private flatTerrain: boolean = true; // Start with flat terrain
  private trees: Tree[] = [];
  private river: River;
  private road: Road;
  private bus: Bus;
  private lastTime: number = 0;
  private mountainBarrier: MountainBarrier;
  private secondWorldTerrain: TerrainChunk[] = [];
  private secondWorldTrees: Tree[] = [];
  private tunnel: MountainTunnel;
  private currentWorld: 'main' | 'second' = 'main';
  private neonSign: NeonSign;
  private directionArrow: DirectionArrow;

  constructor() {
    // Show loading screen first
    this.showLoadingScreen();
  }

  private showLoadingScreen() {
    // Create loading screen container
    const loadingScreen = document.createElement('div');
    loadingScreen.style.position = 'fixed';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = '#333';
    loadingScreen.style.color = 'white';
    loadingScreen.style.fontFamily = 'Arial, sans-serif';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.flexDirection = 'column';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.zIndex = '1000';
    loadingScreen.style.textAlign = 'center';
    loadingScreen.style.padding = '20px';

    // Add game title
    const title = document.createElement('h1');
    title.textContent = 'Andorora Mountain Explorer';
    title.style.marginBottom = '30px';
    title.style.fontSize = '36px';
    title.style.color = '#ff6b6b';
    loadingScreen.appendChild(title);

    // Add game description
    const description = document.createElement('p');
    description.textContent = 'Explore the beautiful mountainous terrain of Andorora in this voxel-based adventure game.';
    description.style.marginBottom = '30px';
    description.style.maxWidth = '600px';
    description.style.lineHeight = '1.5';
    loadingScreen.appendChild(description);

    // Add controls section
    const controlsTitle = document.createElement('h2');
    controlsTitle.textContent = 'Controls';
    controlsTitle.style.marginBottom = '15px';
    controlsTitle.style.color = '#4ecdc4';
    loadingScreen.appendChild(controlsTitle);

    // Create controls list
    const controlsList = document.createElement('ul');
    controlsList.style.listStyleType = 'none';
    controlsList.style.padding = '0';
    controlsList.style.marginBottom = '30px';
    controlsList.style.textAlign = 'left';
    controlsList.style.display = 'inline-block';

    const controls = [
      { key: 'W', action: 'Move Forward' },
      { key: 'S', action: 'Move Backward' },
      { key: 'A', action: 'Move Left' },
      { key: 'D', action: 'Move Right' },
      { key: 'Space', action: 'Jump' },
      { key: 'Shift', action: 'Sprint' },
      { key: 'Mouse', action: 'Look Around' },
      { key: '← →', action: 'Turn Left/Right' }
    ];

    controls.forEach(control => {
      const item = document.createElement('li');
      item.style.margin = '10px 0';
      
      const keySpan = document.createElement('span');
      keySpan.textContent = control.key;
      keySpan.style.display = 'inline-block';
      keySpan.style.width = '80px';
      keySpan.style.backgroundColor = '#222';
      keySpan.style.padding = '5px 10px';
      keySpan.style.borderRadius = '4px';
      keySpan.style.marginRight = '15px';
      keySpan.style.textAlign = 'center';
      
      item.appendChild(keySpan);
      item.appendChild(document.createTextNode(control.action));
      controlsList.appendChild(item);
    });

    loadingScreen.appendChild(controlsList);

    // Add start button
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.padding = '12px 24px';
    startButton.style.fontSize = '18px';
    startButton.style.backgroundColor = '#4ecdc4';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '4px';
    startButton.style.cursor = 'pointer';
    startButton.style.transition = 'background-color 0.3s';
    
    startButton.addEventListener('mouseover', () => {
      startButton.style.backgroundColor = '#3dbdb4';
    });
    
    startButton.addEventListener('mouseout', () => {
      startButton.style.backgroundColor = '#4ecdc4';
    });
    
    startButton.addEventListener('click', () => {
      document.body.removeChild(loadingScreen);
      this.initializeGame();
    });
    
    loadingScreen.appendChild(startButton);

    // Add loading screen to body
    document.body.appendChild(loadingScreen);
  }

  private initializeGame() {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    this.scene.add(ambientLight, pointLight);

    // Initialize game components
    this.controls = new Controls();
    this.player = new Player(this.scene);
    this.terrain = [];

    // Add UI for toggling terrain type
    this.createUI();

    // Generate initial terrain
    this.generateTerrain();
    
    // Generate trees
    this.generateTrees();

    // Generate river and road paths
    this.createRiverAndRoad();
    
    // Create bus
    this.bus = new Bus(this.road);
    this.scene.add(this.bus.mesh);

    // Create and add mountain barrier
    const WORLD_SIZE = 500;
    this.mountainBarrier = new MountainBarrier(WORLD_SIZE);
    this.scene.add(this.mountainBarrier.mesh);

    // Register mountain collision walls with player
    this.mountainBarrier.collisionWalls.forEach(wall => {
      this.player.registerObstacle(wall);
    });

    // Create tunnel through north mountain (after mountain barrier is created)
    const tunnelPosition = new THREE.Vector3(0, 0, -WORLD_SIZE);
    this.tunnel = new MountainTunnel(tunnelPosition, 0);
    this.scene.add(this.tunnel.mesh);

    // Add neon sign above tunnel
    const signPosition = new THREE.Vector3(0, 300, -WORLD_SIZE + 20);
    this.neonSign = new NeonSign(signPosition);
    this.scene.add(this.neonSign.mesh);

    // Add direction arrow above player
    this.directionArrow = new DirectionArrow(this.player);
    this.scene.add(this.directionArrow.mesh);

    // Generate second world
    this.generateSecondWorld();

    // Start game loop
    this.animate();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  private createUI() {
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Toggle Mountainous Terrain';
    toggleButton.style.position = 'absolute';
    toggleButton.style.top = '10px';
    toggleButton.style.left = '10px';
    toggleButton.style.zIndex = '100';
    toggleButton.addEventListener('click', () => {
      this.flatTerrain = !this.flatTerrain;
      this.regenerateTerrain();
    });
    document.body.appendChild(toggleButton);
  }

  private regenerateTerrain() {
    // Remove existing terrain
    for (const chunk of this.terrain) {
      this.scene.remove(chunk.mesh);
    }
    this.terrain = [];
    
    // Generate new terrain
    this.generateTerrain();
  }

  private generateTerrain() {
    const CHUNK_SIZE = 50;
    const RENDER_DISTANCE = 10;

    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        const chunk = new TerrainChunk(
          new THREE.Vector3(x * CHUNK_SIZE, 0, z * CHUNK_SIZE),
          CHUNK_SIZE,
          this.flatTerrain
        );
        this.terrain.push(chunk);
        this.scene.add(chunk.mesh);
      }
    }
  }

  private generateTrees() {
    const CHUNK_SIZE = 50;
    const RENDER_DISTANCE = 10;
    const NUM_TREES = 500;
    
    for (let i = 0; i < NUM_TREES; i++) {
      const x = (Math.random() * 2 - 1) * RENDER_DISTANCE * CHUNK_SIZE;
      const z = (Math.random() * 2 - 1) * RENDER_DISTANCE * CHUNK_SIZE;
      
      // Don't place trees near player start, river, or road
      if (Math.abs(x) < 15 && Math.abs(z) < 15) continue;
      if (Math.abs(z) < 30) continue;
      
      const tree = new Tree(new THREE.Vector3(x, 0, z));
      this.trees.push(tree);
      this.scene.add(tree.mesh);
      
      this.player.registerObstacle(tree.mesh);
    }
  }

  private createRiverAndRoad() {
    // Extended river points through tunnel and into second world
    const riverPoints = [
      // First world points
      new THREE.Vector3(-480, 0, -200),
      new THREE.Vector3(-300, 0, -100),
      new THREE.Vector3(-150, 0, 0),
      new THREE.Vector3(0, 0, 50),
      new THREE.Vector3(150, 0, 0),
      new THREE.Vector3(300, 0, -100),
      // Points through tunnel
      new THREE.Vector3(0, 0, -480),
      new THREE.Vector3(0, 0, -520),
      // Second world points
      new THREE.Vector3(-150, 0, -600),
      new THREE.Vector3(0, 0, -700),
      new THREE.Vector3(150, 0, -800),
      new THREE.Vector3(0, 0, -900),
      new THREE.Vector3(-200, 0, -1000)
    ];
    
    // Create parallel path for road (offset from river)
    const roadOffset = 15; // Reduced offset to fit in tunnel
    const roadPoints = riverPoints.map(point => 
      new THREE.Vector3(point.x, 0, point.z + roadOffset)
    );
    
    // Update river and road with larger dimensions
    this.river = new River(riverPoints, 8); // Wider river
    this.road = new Road(roadPoints, 6);    // Wider road
    
    this.scene.add(this.river.mesh);
    this.scene.add(this.road.mesh);
  }

  private handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate(time: number = 0) {
    requestAnimationFrame((t) => this.animate(t));
    
    const deltaTime = (time - this.lastTime) * 0.001;
    this.lastTime = time;
    
    // Check if player is passing through tunnel
    if (this.tunnel.bounds.entrance.containsPoint(this.player.getPosition())) {
      this.currentWorld = 'second';
    } else if (this.tunnel.bounds.exit.containsPoint(this.player.getPosition())) {
      this.currentWorld = 'main';
    }
    
    // Update bus
    this.bus.update(deltaTime);
    
    // Update player
    this.player.update(this.controls.getState(), this.camera);
    
    // Update neon sign
    this.neonSign.update(deltaTime);
    
    // Update direction arrow
    this.directionArrow.update(this.tunnel.mesh.position);
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }

  private generateSecondWorld() {
    const CHUNK_SIZE = 50;
    const RENDER_DISTANCE = 10;
    
    // Generate terrain for second world
    for (let x = -RENDER_DISTANCE; x <= RENDER_DISTANCE; x++) {
      for (let z = -RENDER_DISTANCE; z <= RENDER_DISTANCE; z++) {
        const chunk = new TerrainChunk(
          new THREE.Vector3(
            x * CHUNK_SIZE,
            0,
            (z - RENDER_DISTANCE * 2) * CHUNK_SIZE // Offset to other side of mountains
          ),
          CHUNK_SIZE,
          this.flatTerrain
        );
        this.secondWorldTerrain.push(chunk);
        this.scene.add(chunk.mesh);
      }
    }
  }
}

class TerrainChunk {
  public mesh: THREE.Mesh;
  private generator: TerrainGenerator;

  constructor(position: THREE.Vector3, size: number, flatTerrain: boolean = true) {
    this.generator = new TerrainGenerator(Math.random(), flatTerrain);
    
    const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    geometry.rotateX(-Math.PI / 2); // Make it horizontal
    
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x3a5a40, // Forest green color
      side: THREE.FrontSide, // Only render top side
      roughness: 0.8,
      metalness: 0.2
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }
}

class Player {
  private position: THREE.Vector3;
  private velocity: THREE.Vector3;
  private playerMesh: THREE.Mesh;
  private speed: number = 8;
  private sprintSpeed: number = 16;
  private mouseSensitivity: number = 0.001;
  private worldBounds: { minX: number, maxX: number, minZ: number, maxZ: number };
  private mountainBarrierDepth: number = 100;
  private obstacles: THREE.Object3D[] = [];
  private cameraOffset: THREE.Vector3;
  private currentCameraPosition: THREE.Vector3;
  private smoothFactor: number = 0.05;
  private rotation: number = 0;

  constructor(scene: THREE.Scene) {
    this.position = new THREE.Vector3(0, 1, 0);
    this.velocity = new THREE.Vector3();
    this.cameraOffset = new THREE.Vector3(0, 3, 8);
    this.currentCameraPosition = new THREE.Vector3().copy(this.position).add(this.cameraOffset);
    
    // Set world boundaries
    const CHUNK_SIZE = 50;
    const RENDER_DISTANCE = 10;
    this.worldBounds = {
      minX: -RENDER_DISTANCE * CHUNK_SIZE,
      maxX: RENDER_DISTANCE * CHUNK_SIZE,
      minZ: -RENDER_DISTANCE * CHUNK_SIZE,
      maxZ: RENDER_DISTANCE * CHUNK_SIZE
    };
    
    // Create player mesh (sphere)
    const geometry = new THREE.SphereGeometry(0.5, 32, 32);
    const material = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    this.playerMesh = new THREE.Mesh(geometry, material);
    this.playerMesh.position.copy(this.position);
    scene.add(this.playerMesh);
    
    // Set up mouse controls
    this.setupMouseControls();
  }
  
  // Add a method to register obstacles
  public registerObstacle(obstacle: THREE.Object3D) {
    this.obstacles.push(obstacle);
  }
  
  private setupMouseControls() {
    // Lock pointer when clicking on the game
    document.addEventListener('click', () => {
      document.body.requestPointerLock();
    });
    
    // Handle mouse movement
    document.addEventListener('mousemove', (event) => {
      if (document.pointerLockElement) {
        this.rotation -= event.movementX * this.mouseSensitivity;
      }
    });
  }

  update(controls: ControlState, camera: THREE.PerspectiveCamera) {
    const speed = controls.sprint ? this.sprintSpeed : this.speed;
    
    // Calculate movement direction relative to player's rotation
    const direction = new THREE.Vector3();
    
    if (controls.forward) direction.z -= 1;
    if (controls.backward) direction.z += 1;
    if (controls.left) direction.x -= 1;
    if (controls.right) direction.x += 1;
    
    // Handle keyboard turning
    if (controls.turnLeft) this.rotation += 0.03;
    if (controls.turnRight) this.rotation -= 0.03;
    
    if (direction.length() > 0) {
      direction.normalize();
      
      // Apply rotation to movement direction
      const rotatedDirection = direction.clone();
      rotatedDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
      
      // Update velocity with smoother acceleration
      this.velocity.x += (rotatedDirection.x * speed - this.velocity.x) * 0.1;
      this.velocity.z += (rotatedDirection.z * speed - this.velocity.z) * 0.1;
    } else {
      // Apply smooth deceleration
      this.velocity.x *= 0.9;
      this.velocity.z *= 0.9;
    }
    
    // Apply gravity and jumping with smoother vertical movement
    if (controls.jump && this.position.y <= 0.6) {
      this.velocity.y = 4;
    }
    this.velocity.y -= 0.15;
    
    // Calculate new position
    const newPosition = this.position.clone();
    newPosition.x += this.velocity.x * 0.016;
    newPosition.y += this.velocity.y * 0.016;
    newPosition.z += this.velocity.z * 0.016;
    
    // Check world boundaries with mountain buffer
    const mountainBuffer = this.mountainBarrierDepth;
    newPosition.x = Math.max(
      this.worldBounds.minX + mountainBuffer, 
      Math.min(this.worldBounds.maxX - mountainBuffer, newPosition.x)
    );
    newPosition.z = Math.max(
      this.worldBounds.minZ + mountainBuffer, 
      Math.min(this.worldBounds.maxZ - mountainBuffer, newPosition.z)
    );
    
    // Ground collision - make it solid
    if (newPosition.y < 0.5) {
      newPosition.y = 0.5;
      this.velocity.y = 0;
    }
    
    // Check obstacle collisions
    if (!this.checkObstacleCollision(newPosition)) {
      this.position.copy(newPosition);
    }
    
    // Update player mesh position and rotation
    this.playerMesh.position.copy(this.position);
    this.playerMesh.rotation.y = this.rotation;
    
    // Calculate ideal camera position based on player rotation
    const rotatedOffset = this.cameraOffset.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation);
    const idealCameraPosition = new THREE.Vector3().copy(this.position).add(rotatedOffset);
    
    // Smoothly interpolate current camera position to ideal position
    this.currentCameraPosition.lerp(idealCameraPosition, this.smoothFactor);
    camera.position.copy(this.currentCameraPosition);
    
    // Smoothly look at a point slightly above the player
    const lookAtPosition = this.position.clone().add(new THREE.Vector3(0, 1, 0));
    camera.lookAt(lookAtPosition);
  }
  
  private checkObstacleCollision(position: THREE.Vector3): boolean {
    const playerRadius = 0.5;
    
    for (const obstacle of this.obstacles) {
      // Get obstacle position and radius (assuming trees are cylinders)
      const obstaclePosition = obstacle.position.clone();
      const obstacleRadius = 0.7; // Tree trunk radius
      
      // Calculate horizontal distance between player and obstacle
      const dx = position.x - obstaclePosition.x;
      const dz = position.z - obstaclePosition.z;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      // Check if collision occurs
      if (distance < (playerRadius + obstacleRadius)) {
        return true; // Collision detected
      }
    }
    
    return false; // No collision
  }

  public getPosition(): THREE.Vector3 {
    return this.position.clone();
  }

  public getRotation(): number {
    return this.rotation;
  }
}

interface ControlState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  jump: boolean;
  sprint: boolean;
  turnLeft: boolean;
  turnRight: boolean;
}

class Controls {
  private state: ControlState = {
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    sprint: false,
    turnLeft: false,
    turnRight: false
  };

  constructor() {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    document.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  private handleKeyDown(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW': this.state.forward = true; break;
      case 'KeyS': this.state.backward = true; break;
      case 'KeyA': this.state.left = true; break;
      case 'KeyD': this.state.right = true; break;
      case 'Space': this.state.jump = true; break;
      case 'ShiftLeft': this.state.sprint = true; break;
      case 'ArrowLeft': this.state.turnLeft = true; break;
      case 'ArrowRight': this.state.turnRight = true; break;
    }
  }

  private handleKeyUp(event: KeyboardEvent) {
    switch (event.code) {
      case 'KeyW': this.state.forward = false; break;
      case 'KeyS': this.state.backward = false; break;
      case 'KeyA': this.state.left = false; break;
      case 'KeyD': this.state.right = false; break;
      case 'Space': this.state.jump = false; break;
      case 'ShiftLeft': this.state.sprint = false; break;
      case 'ArrowLeft': this.state.turnLeft = false; break;
      case 'ArrowRight': this.state.turnRight = false; break;
    }
  }

  getState(): ControlState {
    return { ...this.state };
  }
}

// Add a Tree class
class Tree {
  public mesh: THREE.Group;
  
  constructor(position: THREE.Vector3) {
    this.mesh = new THREE.Group();
    
    // Create tree trunk (cylinder)
    const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1; // Half of trunk height
    
    // Create tree top (cone)
    const topGeometry = new THREE.ConeGeometry(1.5, 3, 8);
    const topMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.position.y = 3.5; // Trunk height + half of cone height
    
    // Add trunk and top to tree group
    this.mesh.add(trunk);
    this.mesh.add(top);
    
    // Set tree position
    this.mesh.position.copy(position);
  }
}

// Add these new classes after the Tree class

class River {
  public mesh: THREE.Group;
  public curve: THREE.CatmullRomCurve3;
  
  constructor(points: THREE.Vector3[], width: number = 4) {
    this.mesh = new THREE.Group();
    
    this.curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(this.curve, 200, width, 8, false);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x4444ff,
      transparent: true,
      opacity: 0.8
    });
    
    const riverMesh = new THREE.Mesh(geometry, material);
    riverMesh.position.y = 0.1;
    
    this.mesh.add(riverMesh);
  }
}

class Road {
  public mesh: THREE.Group;
  public curve: THREE.CatmullRomCurve3;
  
  constructor(points: THREE.Vector3[], width: number = 3) {
    this.mesh = new THREE.Group();
    
    this.curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(this.curve, 200, width, 8, false);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x333333 
    });
    
    const roadMesh = new THREE.Mesh(geometry, material);
    roadMesh.position.y = 0.05;
    
    this.mesh.add(roadMesh);
  }
}

class Bus {
  public mesh: THREE.Group;
  private road: Road;
  private progress: number = 0;
  private speed: number = 0.1; // Adjust for bus speed
  
  constructor(road: Road) {
    this.mesh = new THREE.Group();
    this.road = road;
    
    // Create larger bus body
    const bodyGeometry = new THREE.BoxGeometry(9, 6, 4.5);
    const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xFFD700 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    
    // Create larger windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x88CCFF,
      transparent: true,
      opacity: 0.6
    });
    
    const sideWindowGeometry = new THREE.BoxGeometry(6, 2.4, 4.56);
    const sideWindows = new THREE.Mesh(sideWindowGeometry, windowMaterial);
    sideWindows.position.y = 0.9;
    
    // Add larger wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.6, 16);
    const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });
    
    const wheels = [
      { x: -3, y: -2.4, z: -2.1 },
      { x: 3, y: -2.4, z: -2.1 },
      { x: -3, y: -2.4, z: 2.1 },
      { x: 3, y: -2.4, z: 2.1 }
    ].map(pos => {
      const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos.x, pos.y, pos.z);
      return wheel;
    });
    
    // Add all parts to bus group
    this.mesh.add(body);
    this.mesh.add(sideWindows);
    wheels.forEach(wheel => this.mesh.add(wheel));
  }
  
  update(deltaTime: number) {
    this.progress = (this.progress + this.speed * deltaTime) % 1;
    const position = this.road.curve.getPoint(this.progress);
    const lookAt = this.road.curve.getPoint((this.progress + 0.01) % 1);
    
    this.mesh.position.copy(position);
    this.mesh.position.y += 3; // Increased height above road
    
    this.mesh.lookAt(lookAt);
  }
}

// Add this new class for the mountain barrier
class MountainBarrier {
  public mesh: THREE.Group;
  public collisionWalls: THREE.Mesh[];
  
  constructor(worldSize: number) {
    this.mesh = new THREE.Group();
    this.collisionWalls = [];
    
    // Create invisible collision walls
    const wallHeight = 2000;
    const wallGeometry = new THREE.BoxGeometry(worldSize * 2.2, wallHeight, 100);
    const wallMaterial = new THREE.MeshBasicMaterial({ 
      visible: false // Invisible collision wall
    });
    
    // Create walls for each side
    const sides = [
      { rotation: 0, position: new THREE.Vector3(0, wallHeight/2, -worldSize) },     // North
      { rotation: Math.PI, position: new THREE.Vector3(0, wallHeight/2, worldSize) }, // South
      { rotation: -Math.PI/2, position: new THREE.Vector3(-worldSize, wallHeight/2, 0) }, // West
      { rotation: Math.PI/2, position: new THREE.Vector3(worldSize, wallHeight/2, 0) }    // East
    ];
    
    sides.forEach((side, index) => {
      const wall = new THREE.Mesh(wallGeometry, wallMaterial);
      wall.rotation.y = side.rotation;
      wall.position.copy(side.position);
      
      // If this is the north wall (where tunnel goes), split it into two parts
      if (index === 0) {
        const tunnelWidth = 50;
        const leftWall = wall.clone();
        const rightWall = wall.clone();
        
        // Position the split walls to create a gap for the tunnel
        leftWall.scale.x = 0.45;
        leftWall.position.x = -worldSize * 0.55;
        
        rightWall.scale.x = 0.45;
        rightWall.position.x = worldSize * 0.55;
        
        this.collisionWalls.push(leftWall, rightWall);
        this.mesh.add(leftWall);
        this.mesh.add(rightWall);
      } else {
        this.collisionWalls.push(wall);
        this.mesh.add(wall);
      }
    });

    // Create mountain geometry
    const mountainHeight = 2000;
    const numPeaks = 25; // More peaks for realism
    
    // Create mountains for each side
    const mountainSides = [
      { rotation: 0, position: new THREE.Vector3(0, 0, -worldSize) },     // North
      { rotation: Math.PI, position: new THREE.Vector3(0, 0, worldSize) }, // South
      { rotation: -Math.PI/2, position: new THREE.Vector3(-worldSize, 0, 0) }, // West
      { rotation: Math.PI/2, position: new THREE.Vector3(worldSize, 0, 0) }    // East
    ];
    
    mountainSides.forEach(side => {
      const rangeGroup = new THREE.Group();
      const width = worldSize * 2.2; // Slightly wider to ensure overlap
      
      // Create multiple mountain peaks
      for (let i = 0; i < numPeaks; i++) {
        const xPos = (i / (numPeaks - 1) - 0.5) * width;
        
        // Create main peak
        const peakHeight = mountainHeight * (0.7 + Math.random() * 0.5);
        const baseWidth = 200 + Math.random() * 100;
        
        // Create more detailed mountain geometry using multiple segments
        const peakGeometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const uvs = [];
        const segments = 32;
        
        // Generate vertices for a more natural mountain shape
        for (let ring = 0; ring <= segments; ring++) {
          const v = ring / segments;
          const y = peakHeight * Math.pow(1 - v, 2); // Parabolic curve for height
          const ringRadius = baseWidth * (v * 0.8 + 0.2); // Wider at base, narrower at top
          
          for (let segment = 0; segment <= segments; segment++) {
            const u = segment / segments;
            const angle = u * Math.PI * 2;
            
            // Add some noise to make it less perfect
            const noise = (Math.random() - 0.5) * 20;
            const radiusNoise = (Math.random() - 0.5) * ringRadius * 0.1;
            
            const x = Math.cos(angle) * (ringRadius + radiusNoise);
            const z = Math.sin(angle) * (ringRadius + radiusNoise);
            
            vertices.push(x + xPos, y + noise, z);
            uvs.push(u, v);
          }
        }
        
        // Generate indices for triangles
        for (let ring = 0; ring < segments; ring++) {
          const row1 = ring * (segments + 1);
          const row2 = (ring + 1) * (segments + 1);
          
          for (let segment = 0; segment < segments; segment++) {
            indices.push(
              row1 + segment, row2 + segment, row1 + segment + 1,
              row2 + segment, row2 + segment + 1, row1 + segment + 1
            );
          }
        }
        
        // Create sub-peaks around the main peak
        const numSubPeaks = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < numSubPeaks; j++) {
          const angle = (j / numSubPeaks) * Math.PI * 2;
          const distance = baseWidth * 0.6;
          const subX = Math.cos(angle) * distance;
          const subZ = Math.sin(angle) * distance;
          const subHeight = peakHeight * (0.4 + Math.random() * 0.3);
          
          const subGeometry = new THREE.ConeGeometry(
            baseWidth * 0.3,
            subHeight,
            8 + Math.floor(Math.random() * 4),
            3 + Math.floor(Math.random() * 3),
            true
          );
          
          subGeometry.translate(subX + xPos, subHeight * 0.5, subZ);
          
          // Merge sub-peak geometry with main geometry
          const subVertices = Array.from(subGeometry.attributes.position.array);
          const subIndices = Array.from(subGeometry.index.array);
          
          const offset = vertices.length / 3;
          vertices.push(...subVertices);
          indices.push(...subIndices.map(i => i + offset));
        }
        
        peakGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        peakGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        peakGeometry.setIndex(indices);
        peakGeometry.computeVertexNormals();
        
        // Create material with snow gradient
        const mountainMaterial = new THREE.MeshStandardMaterial({
          vertexColors: true,
          roughness: 0.8,
          metalness: 0.2,
        });
        
        // Add color gradient (rock to snow)
        const colors = new Float32Array(vertices.length);
        for (let i = 0; i < vertices.length; i += 3) {
          const height = vertices[i + 1] / peakHeight;
          const color = new THREE.Color();
          
          if (height > 0.75) {
            // Snow
            color.setRGB(1, 1, 1);
          } else if (height > 0.45) {
            // Mix of rock and snow
            const mix = (height - 0.45) / 0.3;
            color.setRGB(
              0.4 + mix * 0.6,
              0.4 + mix * 0.6,
              0.4 + mix * 0.6
            );
          } else {
            // Rock with slight color variation
            const variation = (Math.random() - 0.5) * 0.1;
            color.setRGB(0.4 + variation, 0.35 + variation, 0.3 + variation);
          }
          
          colors[i] = color.r;
          colors[i + 1] = color.g;
          colors[i + 2] = color.b;
        }
        
        peakGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const peak = new THREE.Mesh(peakGeometry, mountainMaterial);
        rangeGroup.add(peak);
      }
      
      // Add fog between peaks for depth
      const fog = new THREE.Fog(0xaaaaaa, worldSize * 0.5, worldSize);
      rangeGroup.fog = fog;
      
      rangeGroup.rotation.y = side.rotation;
      rangeGroup.position.copy(side.position);
      this.mesh.add(rangeGroup);
    });
  }
}

// Add this new class for the tunnel
class MountainTunnel {
  public mesh: THREE.Group;
  public bounds: {
    entrance: THREE.Box3;
    exit: THREE.Box3;
  };

  constructor(position: THREE.Vector3, rotation: number) {
    this.mesh = new THREE.Group();
    
    // Create tunnel geometry with much larger dimensions
    const tunnelLength = 200;    // Same length
    const tunnelHeight = 250;    // 10x taller (was 25)
    const tunnelWidth = 50;      // Even wider (was 30)
    
    // Main tunnel
    const tunnelGeometry = new THREE.BoxGeometry(tunnelWidth, tunnelHeight, tunnelLength);
    const tunnelMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide // Render both sides of tunnel walls
    });
    
    const tunnel = new THREE.Mesh(tunnelGeometry, tunnelMaterial);
    
    // Add more powerful tunnel lighting
    const lights = [];
    const numLights = 15;  // More lights
    for (let i = 0; i < numLights; i++) {
      const light = new THREE.PointLight(0xffaa44, 1.5, 50);  // Brighter lights with longer range
      light.position.set(0, tunnelHeight * 0.5, -tunnelLength/2 + (i * tunnelLength/numLights));
      lights.push(light);
    }
    
    // Add larger support beams at intervals
    const numSupports = 10;
    const supportGeometry = new THREE.BoxGeometry(tunnelWidth + 4, 4, 8);
    const supportMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });
    
    for (let i = 0; i < numSupports; i++) {
      // Add support beams at different heights
      const heights = [0.2, 0.5, 0.8]; // Support beam heights as percentage of tunnel height
      heights.forEach(heightPercent => {
        const support = new THREE.Mesh(supportGeometry, supportMaterial);
        support.position.set(
          0, 
          tunnelHeight * heightPercent, 
          -tunnelLength/2 + (i * tunnelLength/numSupports)
        );
        this.mesh.add(support);
      });
    }
    
    // Add lights and tunnel to group
    lights.forEach(light => this.mesh.add(light));
    this.mesh.add(tunnel);
    
    // Position and rotate tunnel
    this.mesh.position.copy(position);
    this.mesh.rotation.y = rotation;
    
    // Update collision bounds for larger tunnel
    this.bounds = {
      entrance: new THREE.Box3(
        new THREE.Vector3(-tunnelWidth/2, 0, -tunnelLength/2).add(position),
        new THREE.Vector3(tunnelWidth/2, tunnelHeight, -tunnelLength/2 + 5).add(position)
      ),
      exit: new THREE.Box3(
        new THREE.Vector3(-tunnelWidth/2, 0, tunnelLength/2 - 5).add(position),
        new THREE.Vector3(tunnelWidth/2, tunnelHeight, tunnelLength/2).add(position)
      )
    };
  }
}

// Add new class for neon sign
class NeonSign {
  public mesh: THREE.Group;
  private arrowMesh: THREE.Mesh;
  private flickerTime: number = 0;
  
  constructor(position: THREE.Vector3) {
    this.mesh = new THREE.Group();
    
    // Create large arrow
    const arrowShape = new THREE.Shape();
    arrowShape.moveTo(0, 40);     // Point
    arrowShape.lineTo(-30, -20);  // Left wing
    arrowShape.lineTo(-15, -20);  // Left inner
    arrowShape.lineTo(-15, -40);  // Left base
    arrowShape.lineTo(15, -40);   // Right base
    arrowShape.lineTo(15, -20);   // Right inner
    arrowShape.lineTo(30, -20);   // Right wing
    arrowShape.lineTo(0, 40);     // Back to point

    const arrowGeometry = new THREE.ShapeGeometry(arrowShape);
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      side: THREE.DoubleSide,
      emissive: 0xff00ff,
      emissiveIntensity: 1
    });
    
    this.arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    this.arrowMesh.scale.set(3, 3, 3);
    
    // Add glow effect
    const glowGeometry = new THREE.PlaneGeometry(200, 200);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xff00ff,
      transparent: true,
      opacity: 0.2
    });
    
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.z = -1;
    
    // Add everything to group
    this.mesh.add(this.arrowMesh);
    this.mesh.add(glowMesh);
    
    // Position the sign
    this.mesh.position.copy(position);
    
    // Add point lights for additional glow
    const lights = [
      new THREE.PointLight(0xff00ff, 2, 100),
      new THREE.PointLight(0xff00ff, 2, 100),
      new THREE.PointLight(0xff00ff, 2, 100)
    ];
    
    lights[0].position.set(0, 0, 20);
    lights[1].position.set(-50, 0, 20);
    lights[2].position.set(50, 0, 20);
    
    lights.forEach(light => this.mesh.add(light));
  }
  
  update(deltaTime: number) {
    this.flickerTime += deltaTime;
    
    // Create flickering effect
    const flicker = Math.sin(this.flickerTime * 10) * 0.2 + 0.8;
    (this.arrowMesh.material as THREE.MeshBasicMaterial).emissiveIntensity = flicker;
    
    // Make arrow bounce slightly
    this.arrowMesh.position.y = Math.sin(this.flickerTime * 2) * 5;
  }
}

// Add new class for direction arrow
class DirectionArrow {
  public mesh: THREE.Group;
  private arrowMesh: THREE.Mesh;
  private player: Player;
  private rotationSpeed: number = 5; // Speed of rotation adjustment
  private currentRotation: number = 0;
  
  constructor(player: Player) {
    this.player = player;
    this.mesh = new THREE.Group();
    
    // Create smaller arrow pointing forward
    const arrowGeometry = new THREE.ConeGeometry(0.3, 1.5, 8); // Even smaller
    const arrowMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0.8
    });
    
    this.arrowMesh = new THREE.Mesh(arrowGeometry, arrowMaterial);
    this.arrowMesh.rotation.x = -Math.PI / 2;
    
    // Add smaller cylinder shaft
    const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 8); // Thinner shaft
    const shaft = new THREE.Mesh(shaftGeometry, arrowMaterial);
    shaft.position.y = -0.75; // Adjusted for smaller size
    
    this.mesh.add(this.arrowMesh);
    this.mesh.add(shaft);
    
    // Position arrow closer to player
    this.mesh.position.y = 2; // Even lower
  }
  
  update(targetPosition: THREE.Vector3) {
    // Update position to follow player
    const playerPos = this.player.getPosition();
    this.mesh.position.x = playerPos.x;
    this.mesh.position.z = playerPos.z;
    
    // Calculate direction to tunnel
    const direction = new THREE.Vector3()
      .subVectors(targetPosition, playerPos)
      .normalize();
    
    // Calculate target rotation to point toward tunnel
    const targetAngle = Math.atan2(direction.x, direction.z);
    
    // Smoothly interpolate current rotation to target rotation
    const angleDiff = targetAngle - this.currentRotation;
    
    // Normalize angle difference to [-PI, PI]
    let normalizedDiff = angleDiff;
    while (normalizedDiff > Math.PI) normalizedDiff -= Math.PI * 2;
    while (normalizedDiff < -Math.PI) normalizedDiff += Math.PI * 2;
    
    // Update current rotation with smooth damping
    this.currentRotation += normalizedDiff * this.rotationSpeed * 0.016; // Assuming 60fps
    this.mesh.rotation.y = this.currentRotation;
    
    // Add gentle swaying motion
    this.mesh.rotation.z = Math.sin(Date.now() * 0.003) * 0.1; // Side-to-side sway
    this.mesh.rotation.x = Math.sin(Date.now() * 0.002) * 0.05; // Forward-back tilt
    
    // Add floating motion
    this.mesh.position.y = 2 + Math.sin(Date.now() * 0.002) * 0.1;
    
    // Fade out when close to tunnel
    const distance = playerPos.distanceTo(targetPosition);
    this.arrowMesh.material.opacity = Math.min(0.8, distance / 200);
  }
}

// Start the game when the page loads
window.addEventListener('load', () => {
  new Game();
});
