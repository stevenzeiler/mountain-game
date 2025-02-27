import * as THREE from 'three';
import { GameEntity } from '../game/types';
import { GAME_CONFIG } from '../game/config';

export class ForceField implements GameEntity {
  public mesh: THREE.Mesh;
  private time: number = 0;
  private material: THREE.ShaderMaterial;

  constructor(width: number, height: number = GAME_CONFIG.FORCE_FIELD.HEIGHT) {
    const { WAVE_SPEED, WAVE_FREQUENCY, BASE_ALPHA, WAVE_ALPHA, COLOR } = GAME_CONFIG.FORCE_FIELD;

    // Create custom shader material for the force field effect
    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        color: { value: new THREE.Color(COLOR) },
        waveSpeed: { value: WAVE_SPEED },
        waveFreq: { value: WAVE_FREQUENCY },
        baseAlpha: { value: BASE_ALPHA },
        waveAlpha: { value: WAVE_ALPHA }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color;
        uniform float waveSpeed;
        uniform float waveFreq;
        uniform float baseAlpha;
        uniform float waveAlpha;
        
        varying vec2 vUv;
        varying vec3 vPosition;
        
        void main() {
          // Create multiple waves for more interesting effect
          float wave1 = sin(vUv.y * waveFreq + time * waveSpeed) * 0.5 + 0.5;
          float wave2 = sin(vUv.x * waveFreq * 0.5 + time * waveSpeed * 0.7) * 0.5 + 0.5;
          
          // Add some horizontal variation
          float horizontalVariation = sin(vPosition.x * 0.02 + time * 0.5) * 0.5 + 0.5;
          
          // Combine waves
          float wave = (wave1 * 0.7 + wave2 * 0.3) * horizontalVariation;
          
          // Calculate alpha with base transparency and wave effect
          float alpha = baseAlpha + wave * waveAlpha;
          
          // Add subtle color variation based on waves
          vec3 finalColor = color * (0.8 + wave * 0.2);
          
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    this.material = shaderMaterial;
    
    // Create a simple plane geometry for the force field
    const geometry = new THREE.PlaneGeometry(width, height, 32, 32); // More segments for better wave effect
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  update(deltaTime: number): void {
    this.time += deltaTime;
    this.material.uniforms.time.value = this.time;
  }
} 