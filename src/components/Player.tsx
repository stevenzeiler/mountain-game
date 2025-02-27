import React, { forwardRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useSphere } from '@react-three/cannon';
import { Vector3 } from 'three';

interface PlayerProps {
  position?: [number, number, number];
}

export const Player = forwardRef<any, PlayerProps>(({ position = [0, 10, 0] }, ref) => {
  const [sphereRef, api] = useSphere(() => ({
    mass: 1,
    position,
    args: [0.5],
    material: { friction: 0 }
  }));

  const velocity = new Vector3();
  const direction = new Vector3();

  useFrame((state) => {
    // Update player physics and movement
    const { forward, backward, left, right, jump, sprint } = controls.current;
    
    direction.set(0, 0, 0);
    
    if (forward) direction.z -= 1;
    if (backward) direction.z += 1;
    if (left) direction.x -= 1;
    if (right) direction.x += 1;
    
    direction.normalize();
    
    const speed = sprint ? 10 : 5;
    velocity.set(
      direction.x * speed,
      velocity.y,
      direction.z * speed
    );
    
    api.velocity.set(velocity.x, velocity.y, velocity.z);
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[0.5]} />
      <meshStandardMaterial color="red" />
    </mesh>
  );
}); 