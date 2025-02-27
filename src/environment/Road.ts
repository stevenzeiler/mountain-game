import * as THREE from 'three';
import { GameEntity } from '../game/types';
import { GAME_CONFIG } from '../game/config';
import { Bridge } from './Bridge';
import { River } from './River';

export class Road implements GameEntity {
  public mesh: THREE.Group;
  public curve: THREE.CatmullRomCurve3;
  public bridges: Bridge[] = [];

  constructor(width: number = 15, river?: River) {
    this.mesh = new THREE.Group();
    
    // Create a curved path for the road
    const { CHUNK_SIZE, RENDER_DISTANCE } = GAME_CONFIG.WORLD;
    const worldDepth = CHUNK_SIZE * RENDER_DISTANCE.Z * 2;
    
    // Generate control points for the curve
    const points = this.generateRoadPoints(worldDepth);
    this.curve = new THREE.CatmullRomCurve3(points);

    // Get points along the curve for road segments
    const segments = Math.floor(worldDepth / 10);
    const roadPoints = this.curve.getPoints(segments);

    // Find river intersections if river is provided
    const bridgeSegments = new Set<number>();
    if (river) {
      const riverPoints = river.curve.getPoints(segments);
      for (let i = 0; i < roadPoints.length - 1; i++) {
        const roadStart = roadPoints[i];
        const roadEnd = roadPoints[i + 1];
        
        for (let j = 0; j < riverPoints.length - 1; j++) {
          const riverStart = riverPoints[j];
          const riverEnd = riverPoints[j + 1];
          
          if (this.segmentsIntersect(
            roadStart, roadEnd,
            riverStart, riverEnd
          )) {
            bridgeSegments.add(i);
            // Create bridge at intersection
            const bridge = new Bridge(roadStart, roadEnd, width);
            this.bridges.push(bridge);
            this.mesh.add(bridge.mesh);
          }
        }
      }
    }

    // Create road segments
    for (let i = 0; i < roadPoints.length - 1; i++) {
      // Skip road segments where bridges are
      if (bridgeSegments.has(i)) continue;

      const current = roadPoints[i];
      const next = roadPoints[i + 1];
      
      // Calculate segment direction and length
      const length = current.distanceTo(next);

      // Create road segment geometry
      const segmentGeometry = new THREE.PlaneGeometry(width, length);
      const roadMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide
      });

      const segment = new THREE.Mesh(segmentGeometry, roadMaterial);

      // Position and rotate segment
      segment.position.copy(current).add(next).multiplyScalar(0.5);
      segment.position.y = 0.1; // Slightly above ground to prevent z-fighting

      // Calculate rotation to align with road direction
      segment.lookAt(next);
      segment.rotateX(Math.PI / 2); // Rotate to make horizontal

      segment.receiveShadow = true;
      this.mesh.add(segment);

      // Add road markings for this segment
      this.addRoadMarkings(current, next, width);
    }
  }

  private segmentsIntersect(
    a1: THREE.Vector3,
    a2: THREE.Vector3,
    b1: THREE.Vector3,
    b2: THREE.Vector3
  ): boolean {
    // Project onto XZ plane for intersection check
    const a1_2d = new THREE.Vector2(a1.x, a1.z);
    const a2_2d = new THREE.Vector2(a2.x, a2.z);
    const b1_2d = new THREE.Vector2(b1.x, b1.z);
    const b2_2d = new THREE.Vector2(b2.x, b2.z);

    // Calculate intersection using cross products
    const denominator = (a2_2d.x - a1_2d.x) * (b2_2d.y - b1_2d.y) - 
                       (a2_2d.y - a1_2d.y) * (b2_2d.x - b1_2d.x);
    
    if (denominator === 0) return false;

    const ua = ((b2_2d.x - b1_2d.x) * (a1_2d.y - b1_2d.y) - 
                (b2_2d.y - b1_2d.y) * (a1_2d.x - b1_2d.x)) / denominator;
    const ub = ((a2_2d.x - a1_2d.x) * (a1_2d.y - b1_2d.y) - 
                (a2_2d.y - a1_2d.y) * (a1_2d.x - b1_2d.x)) / denominator;

    return ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1;
  }

  private generateRoadPoints(worldDepth: number): THREE.Vector3[] {
    const points: THREE.Vector3[] = [];
    const segments = 8;
    const segmentLength = worldDepth / segments;
    
    // Generate curved road points
    for (let i = 0; i <= segments; i++) {
      const z = (i - segments / 2) * segmentLength;
      // Make road curve in opposite direction to river
      const x = -Math.sin(i * 0.4) * 150; // Different frequency and amplitude than river
      points.push(new THREE.Vector3(x, 0, z));
    }
    
    return points;
  }

  private addRoadMarkings(start: THREE.Vector3, end: THREE.Vector3, roadWidth: number): void {
    const direction = end.clone().sub(start).normalize();
    const length = start.distanceTo(end);
    const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x);
    
    const markingMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.4,
      metalness: 0.0
    });

    // Create center line marking
    const centerMarking = new THREE.Mesh(
      new THREE.PlaneGeometry(0.3, length),
      markingMaterial
    );
    
    // Position and rotate marking
    centerMarking.position.copy(start)
      .add(end)
      .multiplyScalar(0.5)
      .setY(0.2); // Slightly above road
    
    centerMarking.lookAt(end);
    centerMarking.rotateX(Math.PI / 2);
    this.mesh.add(centerMarking);

    // Add side markings
    [-1, 1].forEach(side => {
      const sideMarking = new THREE.Mesh(
        new THREE.PlaneGeometry(0.3, length),
        markingMaterial
      );
      
      sideMarking.position.copy(centerMarking.position)
        .add(perpendicular.clone().multiplyScalar(roadWidth * 0.4 * side));
      
      sideMarking.rotation.copy(centerMarking.rotation);
      this.mesh.add(sideMarking);
    });
  }

  update(_deltaTime: number): void {
    // No update needed for static road
  }
} 