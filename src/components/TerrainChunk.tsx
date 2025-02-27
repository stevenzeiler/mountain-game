import React, { useMemo } from 'react';
import { TerrainGenerator } from '../utils/TerrainGenerator';

interface TerrainChunkProps {
  position: [number, number, number];
  size: number;
}

export function TerrainChunk({ position, size }: TerrainChunkProps) {
  const terrain = useMemo(() => {
    const generator = new TerrainGenerator();
    const vertices = [];
    const indices = [];
    
    // Generate terrain mesh
    for (let x = 0; x <= size; x++) {
      for (let z = 0; z <= size; z++) {
        const worldX = position[0] + x;
        const worldZ = position[2] + z;
        const height = generator.getHeight(worldX, worldZ);
        
        vertices.push(x, height, z);
      }
    }
    
    // Generate indices for triangles
    for (let x = 0; x < size; x++) {
      for (let z = 0; z < size; z++) {
        const a = x + z * (size + 1);
        const b = (x + 1) + z * (size + 1);
        const c = x + (z + 1) * (size + 1);
        const d = (x + 1) + (z + 1) * (size + 1);
        
        indices.push(a, b, c);
        indices.push(b, d, c);
      }
    }
    
    return { vertices, indices };
  }, [position, size]);

  return (
    <mesh position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={terrain.vertices.length / 3}
          array={new Float32Array(terrain.vertices)}
          itemSize={3}
        />
        <bufferAttribute
          attach="index"
          count={terrain.indices.length}
          array={new Uint16Array(terrain.indices)}
          itemSize={1}
        />
      </bufferGeometry>
      <meshStandardMaterial wireframe color="green" />
    </mesh>
  );
} 