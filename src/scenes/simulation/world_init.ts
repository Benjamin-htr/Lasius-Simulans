import { createWorld } from "koota";
import { AntSettings, AntState } from "../../core/traits/ant";
import { Position } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { Velocity } from "../../core/traits/velocity";

export const world = createWorld();

// Spawn an ant
for (let i = 0; i < 1; i++) {
  world.spawn(
    // We change z to avoid z-fighting bug
    Position({ x: 0, y: 0, z: i * 0.0001 }),
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
