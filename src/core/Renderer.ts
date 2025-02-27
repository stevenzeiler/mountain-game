import * as THREE from 'three';

export class Renderer {
  private renderer: THREE.WebGLRenderer;

  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance'
    });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadow mapping
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Add renderer to DOM
    document.body.appendChild(this.renderer.domElement);

    // Handle window resize
    this.handleResize = this.handleResize.bind(this);
    window.addEventListener('resize', this.handleResize);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    this.renderer.render(scene, camera);
  }

  handleResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  destroy(): void {
    window.removeEventListener('resize', this.handleResize);
    document.body.removeChild(this.renderer.domElement);
    this.renderer.dispose();
  }
} 