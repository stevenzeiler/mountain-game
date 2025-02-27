import * as THREE from 'three';
import { GameEntity } from '../game/types';
import { GAME_CONFIG } from '../game/config';

export class River implements GameEntity {
  public mesh: THREE.Group;
  public curve: THREE.CatmullRomCurve3;
  private waterMaterial: THREE.ShaderMaterial;
  private time: number = 0;

  constructor(width: number = 20) {
    this.mesh = new THREE.Group();
    
    // Create a curved path for the river
    const { CHUNK_SIZE, RENDER_DISTANCE } = GAME_CONFIG.WORLD;
    const worldDepth = CHUNK_SIZE * RENDER_DISTANCE.Z * 2;
    
    // Generate control points for the curve
    const points = this.generateRiverPoints(worldDepth);
    this.curve = new THREE.CatmullRomCurve3(points);

    // Create water material with simplified shader
    this.waterMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(0x3498db) }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        varying vec2 vUv;
        void main() {
          float wave = sin(vUv.x * 5.0 + time * 0.5 + sin(vUv.y * 3.0 + time * 0.3)) * 0.5 + 0.5;
          vec3 finalColor = color * (0.8 + wave * 0.2);
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    // Create river with fewer segments
    const segments = Math.floor(worldDepth / 50); // Reduced number of segments
    const riverPoints = this.curve.getPoints(segments);

    for (let i = 0; i < riverPoints.length - 1; i++) {
      const current = riverPoints[i];
      const next = riverPoints[i + 1];
      
      const direction = next.clone().sub(current).normalize();
      const length = current.distanceTo(next);
      const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);

      // Create single water surface for longer segment
      const waterGeometry = new THREE.PlaneGeometry(width, length, 1, 1); // Minimal segments
      const waterSegment = new THREE.Mesh(waterGeometry, this.waterMaterial);

      waterSegment.position.copy(current).add(next).multiplyScalar(0.5);
      waterSegment.position.y = -2;
      waterSegment.lookAt(next);
      waterSegment.rotateX(Math.PI / 2);
      
      this.mesh.add(waterSegment);

      // Simplified banks - just one mesh per side
      const bankMaterial = new THREE.MeshStandardMaterial({
        color: 0x7c6354,
        roughness: 0.8,
        metalness: 0.1
      });

      [-1, 1].forEach(side => {
        const bankGeometry = new THREE.PlaneGeometry(width * 0.5, length, 1, 1);
        const bank = new THREE.Mesh(bankGeometry, bankMaterial);
        
        bank.position.copy(current)
          .add(next)
          .multiplyScalar(0.5)
          .add(perpendicular.clone().multiplyScalar(width * 0.75 * side));
        
        bank.position.y = -1.5;
        bank.lookAt(next);
        bank.rotateX(Math.PI / 2);
        bank.rotateZ(side * Math.PI * 0.15);
        
        bank.receiveShadow = true;
        bank.castShadow = true;
        
        this.mesh.add(bank);
      });
    }
  }

  private generateRiverPoints(worldDepth: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const segments = 6; // Reduced number of control points
    const segmentLength = worldDepth / segments;
    
    for (let i = 0; i <= segments; i++) {
      const z = (i - segments / 2) * segmentLength;
      const x = Math.sin(i * 0.5) * 100;
      points.push(new THREE.Vector3(x, -2, z));
    }
    
    return points;
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.waterMaterial.uniforms.time.value = this.time;
  }
} 