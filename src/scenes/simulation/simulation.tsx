import { extend, useFrame } from "@react-three/fiber";
import { useWorld } from "koota/react";
import { useMemo } from "react";
import { BoxLineGeometry as THREEBoxLineGeometry } from "three/examples/jsm/Addons.js";
import { createMovementSystem } from "../../core/systems/movement";
import { Ants } from "../ant/ant";
import { useSimulation } from "./simulation_context";

const BoxLineGeometry = extend(THREEBoxLineGeometry);

export function Simulation() {
  const { config } = useSimulation();
  const world = useWorld();
  const { gridSize } = config;

  const movementSystem = useMemo(() => createMovementSystem(world, config), [config, world]);

  useFrame((_, delta) => {
    movementSystem(delta);
  });

  return (
    <>
      <ambientLight intensity={Math.PI} />

      <Ants />

      <lineSegments>
        <BoxLineGeometry args={[gridSize.width, gridSize.height, 1, 1, 1]} />
        <lineBasicMaterial color="red" />
      </lineSegments>
    </>
  );
}
