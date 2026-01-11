import { createWorld } from "koota";
import { AntSettings, AntState } from "../../core/traits/ant";
import { Position } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { Velocity } from "../../core/traits/velocity";

type WorldInit = {
  antCount: number;
};

export function initWorld(config: WorldInit) {
  const world = createWorld();

  // Spawn ants
  for (let i = 0; i < config.antCount; i++) {
    world.spawn(
      // We change z to avoid z-fighting bug
      Position({ x: 0, y: 0, z: 0 + i * 0.000001 }),
      Velocity({ x: 5, y: 0 }),
      Rotation({ angle: 0 }),
      AntSettings({
        maxSpeed: 10,
        acceleration: 40.0,
        randomSteerStrength: 1.0,
        randomSteerMaxDuration: 1.5,
        collisionRadius: 1.5,
        targetSteerStrength: 4.0,
      }),
      AntState({
        nextRandomSteerTime: 0,
        randomSteerForce: { x: 0, y: 0 },
        forwardDir: { x: 1, y: 0 },
      })
    );
  }

  return world;
}
