export class TerrainGenerator {
  private seed: number;
  private p: number[];
  private flatMode: boolean;

  constructor(seed: number = Math.random(), flatMode: boolean = true) {
    this.seed = seed;
    this.flatMode = flatMode;
    // Initialize the permutation table in the constructor
    const temp = Array.from({ length: 256 }, (_, i) => Math.floor(Math.random() * 256));
    this.p = Array.from({ length: 512 }, (_, i) => i < 256 ? temp[i] : temp[i - 256]);
  }

  private noise2D(x: number, y: number): number {
    // Simplified Perlin noise implementation
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y;
    const B = this.p[X + 1] + Y;
    
    return this.lerp(v,
      this.lerp(u,
        this.grad(this.p[A], x, y),
        this.grad(this.p[B], x - 1, y)
      ),
      this.lerp(u,
        this.grad(this.p[A + 1], x, y - 1),
        this.grad(this.p[B + 1], x - 1, y - 1)
      )
    );
  }

  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const grad = 1 + (h & 7);
    return ((h & 8) ? -grad : grad) * x + ((h & 4) ? -grad : grad) * y;
  }

  public getHeight(x: number, z: number): number {
    // If in flat mode, return a constant height
    if (this.flatMode) {
      return 0; // Flat terrain at y=0
    }
    
    // Otherwise generate mountainous terrain using multiple octaves of noise
    let height = 0;
    let amplitude = 1000;
    let frequency = 0.005;
    
    for (let i = 0; i < 4; i++) {
      height += this.noise2D(x * frequency, z * frequency) * amplitude;
      amplitude *= 0.5;
      frequency *= 2;
    }

    return height;
  }
  
  // Method to toggle between flat and mountainous terrain
  public setFlatMode(flat: boolean): void {
    this.flatMode = flat;
  }
} 