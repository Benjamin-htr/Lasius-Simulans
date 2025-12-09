import type { World } from "koota";
import { simulationConfig } from "../../scenes/simulation/simulation_config";
import { AntSettings, AntState } from "../traits/ant";
import { Position } from "../traits/position";
import { Rotation } from "../traits/rotation";
import { Velocity } from "../traits/velocity";

/**
 * Movement system inspired by Sebastian Lague's Ant Simulation
 * Handles random steering, collision with boundaries, and velocity-based movement
 */
export function createMovementSystem(world: World, config: typeof simulationConfig) {
  return (deltaTime: number) => {
    const { gridSize } = config;
    const halfWidth = gridSize.width / 2;
    const halfHeight = gridSize.height / 2;

    world
      .query(Position, Velocity, Rotation, AntSettings, AntState)
      .updateEach(([position, velocity, rotation, settings, state]) => {
        const currentTime = performance.now() / 1000; // Convert to seconds

        // Handle random steering
        if (currentTime > state.nextRandomSteerTime) {
          state.nextRandomSteerTime =
            currentTime +
            Math.random() * (settings.randomSteerMaxDuration * (2 / 3)) +
            settings.randomSteerMaxDuration / 3;

          // Generate random direction similar to current forward direction
          const randomDir = getRandomDir(state.forwardDir.x, state.forwardDir.y);
          state.randomSteerForce.x = randomDir.x * settings.randomSteerStrength;
          state.randomSteerForce.y = randomDir.y * settings.randomSteerStrength;
        }

        // Calculate steering force
        const steerForceX = state.randomSteerForce.x;
        const steerForceY = state.randomSteerForce.y;

        // Calculate desired velocity
        const steerForceMag = Math.sqrt(steerForceX * steerForceX + steerForceY * steerForceY);
        const desiredVelocityX =
          steerForceMag > 0 ? (steerForceX / steerForceMag) * settings.maxSpeed : settings.maxSpeed;
        const desiredVelocityY = steerForceMag > 0 ? (steerForceY / steerForceMag) * settings.maxSpeed : 0;

        // Steer towards desired velocity
        steerTowards(velocity, desiredVelocityX, desiredVelocityY, settings, deltaTime);

        // Update forward direction
        const velocityMag = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
        if (velocityMag > 0.01) {
          state.forwardDir.x = velocity.x / velocityMag;
          state.forwardDir.y = velocity.y / velocityMag;
        }

        // Calculate desired position
        const desiredX = position.x + velocity.x * deltaTime;
        const desiredY = position.y + velocity.y * deltaTime;

        // Check collision with boundaries and reflect if needed
        let finalX = desiredX;
        let finalY = desiredY;
        let reflectX = false;
        let reflectY = false;

        // Left/Right boundaries
        if (desiredX - settings.collisionRadius < -halfWidth) {
          finalX = -halfWidth + settings.collisionRadius;
          reflectX = true;
        } else if (desiredX + settings.collisionRadius > halfWidth) {
          finalX = halfWidth - settings.collisionRadius;
          reflectX = true;
        }

        // Top/Bottom boundaries
        if (desiredY - settings.collisionRadius < -halfHeight) {
          finalY = -halfHeight + settings.collisionRadius;
          reflectY = true;
        } else if (desiredY + settings.collisionRadius > halfHeight) {
          finalY = halfHeight - settings.collisionRadius;
          reflectY = true;
        }

        // Reflect velocity on collision
        if (reflectX) {
          velocity.x = -velocity.x;
          state.forwardDir.x = -state.forwardDir.x;
          // Add some random steering on collision
          const randomDir = getRandomDir(state.forwardDir.x, state.forwardDir.y);
          state.randomSteerForce.x = randomDir.x * settings.randomSteerStrength * 2;
          state.randomSteerForce.y = randomDir.y * settings.randomSteerStrength * 2;
          state.nextRandomSteerTime = currentTime + 0.5;
        }

        if (reflectY) {
          velocity.y = -velocity.y;
          state.forwardDir.y = -state.forwardDir.y;
          // Add some random steering on collision
          const randomDir = getRandomDir(state.forwardDir.x, state.forwardDir.y);
          state.randomSteerForce.x = randomDir.x * settings.randomSteerStrength * 2;
          state.randomSteerForce.y = randomDir.y * settings.randomSteerStrength * 2;
          state.nextRandomSteerTime = currentTime + 0.5;
        }

        // Update position
        position.x = finalX;
        position.y = finalY;

        // Update rotation based on forward direction
        rotation.angle = Math.atan2(state.forwardDir.y, state.forwardDir.x);
      });
  };
}

/**
 * Steers current velocity towards desired velocity
 */
function steerTowards(
  velocity: { x: number; y: number },
  desiredX: number,
  desiredY: number,
  settings: { acceleration: number; maxSpeed: number },
  deltaTime: number
) {
  // Calculate steering force
  const steeringForceX = desiredX - velocity.x;
  const steeringForceY = desiredY - velocity.y;

  // Calculate acceleration
  const steeringForceMag = Math.sqrt(steeringForceX * steeringForceX + steeringForceY * steeringForceY);
  const accelerationMag = Math.min(steeringForceMag * settings.acceleration, settings.acceleration);

  let accelerationX = 0;
  let accelerationY = 0;

  if (steeringForceMag > 0) {
    accelerationX = (steeringForceX / steeringForceMag) * accelerationMag;
    accelerationY = (steeringForceY / steeringForceMag) * accelerationMag;
  }

  // Update velocity
  velocity.x += accelerationX * deltaTime;
  velocity.y += accelerationY * deltaTime;

  // Clamp to max speed
  const velocityMag = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  if (velocityMag > settings.maxSpeed) {
    velocity.x = (velocity.x / velocityMag) * settings.maxSpeed;
    velocity.y = (velocity.y / velocityMag) * settings.maxSpeed;
  }
}

/**
 * Gets a random direction similar to the reference direction
 * Based on Sebastian Lague's implementation
 */
function getRandomDir(refX: number, refY: number): { x: number; y: number } {
  let bestX = 0;
  let bestY = 0;
  let maxDot = -1;

  const iterations = 4;
  for (let i = 0; i < iterations; i++) {
    // Random direction on unit circle
    const angle = Math.random() * Math.PI * 2;
    const randomX = Math.cos(angle);
    const randomY = Math.sin(angle);

    // Dot product with reference direction
    const dot = refX * randomX + refY * randomY;

    if (dot > maxDot) {
      maxDot = dot;
      bestX = randomX;
      bestY = randomY;
    }
  }

  return { x: bestX, y: bestY };
}
