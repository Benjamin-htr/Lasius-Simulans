import { createWorld } from "koota";
import { AntSettings, AntState } from "../../core/traits/ant";
import { Position } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { Selectable } from "../../core/traits/selectable";
import { Velocity } from "../../core/traits/velocity";
import { ANT_MAX_Z } from "./simulation_config";

type WorldInit = {
  antCount: number;
};

export function initWorld(config: WorldInit) {
  const world = createWorld();

  // Spawn ants
  for (let i = 0; i < config.antCount; i++) {
    const z = (i / config.antCount) * ANT_MAX_Z;
    world.spawn(
      // We change z to avoid z-fighting bug
      Position({ x: 0, y: 0, z: z }),
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
      }),
      Selectable({ isSelected: false, radius: 2.0 })
    );
  }

  return world;
}
