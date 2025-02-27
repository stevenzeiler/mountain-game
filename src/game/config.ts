export const GAME_CONFIG = {
  WORLD: {
    CHUNK_SIZE: 50,
    RENDER_DISTANCE: {
      X: 20, // Doubled for width
      Z: 10  // Normal depth
    },
    SIZE: 500,
    BARRIER_DEPTH: 100
  },
  PLAYER: {
    SPEED: 8,
    SPRINT_SPEED: 16,
    MOUSE_SENSITIVITY: 0.001,
    CAMERA_OFFSET: { x: 0, y: 3, z: 8 },
    CAMERA_SMOOTH_FACTOR: 0.05
  },
  TERRAIN: {
    NUM_TREES: 1000,
    TREE_SAFE_ZONE: 15,
    ROAD_SAFE_ZONE: 30
  },
  FORCE_FIELD: {
    COLOR: 0x00ffff,
    HEIGHT: 2000,
    WAVE_SPEED: 2.0,
    WAVE_FREQUENCY: 20.0,
    BASE_ALPHA: 0.2,
    WAVE_ALPHA: 0.1
  }
} as const; 