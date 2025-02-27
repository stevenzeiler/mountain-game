import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { TerrainChunk } from './TerrainChunk';
import { Player } from './Player';
import { useKeyboardControls } from '../hooks/useKeyboardControls';

const CHUNK_SIZE = 16;
const RENDER_DISTANCE = 3;

export default function Game() {
  const playerRef = useRef<any>();
  const { moveForward, moveBackward, moveLeft, moveRight, jump, sprint } = useKeyboardControls();

  useFrame((state, delta) => {
    if (playerRef.current) {
      // Update player position and camera
      const player = playerRef.current;
      // Movement logic here
    }
  });

  return (
    <>
      <Player ref={playerRef} />
      {/* Generate terrain chunks around player */}
      {Array.from({ length: RENDER_DISTANCE * 2 + 1 }, (_, i) => 
        Array.from({ length: RENDER_DISTANCE * 2 + 1 }, (_, j) => (
          <TerrainChunk 
            key={`${i}-${j}`}
            position={[
              (i - RENDER_DISTANCE) * CHUNK_SIZE,
              0,
              (j - RENDER_DISTANCE) * CHUNK_SIZE
            ]}
            size={CHUNK_SIZE}
          />
        ))
      )}
    </>
  );
} 