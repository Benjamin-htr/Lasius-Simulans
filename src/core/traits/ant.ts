import { trait } from "koota";

// Ant settings/parameters
export const AntSettings = trait({
  maxSpeed: 20.0, // Maximum speed
  acceleration: 40.0, // Acceleration rate
  randomSteerStrength: 1.0, // Strength of random steering
  randomSteerMaxDuration: 1.5, // Max duration of random steering
  collisionRadius: 0.5, // Radius for collision detection
  targetSteerStrength: 4.0, // Strength when steering towards target
});

// Ant state for steering and movement
export const AntState = trait({
  nextRandomSteerTime: 0,
  randomSteerForce: () => ({ x: 0, y: 0 }),
  forwardDir: () => ({ x: 1, y: 0 }), // Current forward direction (normalized)
});
