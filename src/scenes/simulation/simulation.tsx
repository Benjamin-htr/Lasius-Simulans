import { extend, useFrame, useThree } from "@react-three/fiber";
import { useWorld } from "koota/react";
import { useEffect, useMemo } from "react";
import { BoxLineGeometry as THREEBoxLineGeometry } from "three/examples/jsm/Addons.js";
import { createMovementSystem } from "../../core/systems/movement";
import { createSelectionSystem } from "../../core/systems/selection";
import { Ants } from "../ant/ant";
import { useSimulation } from "./simulation_context";

const BoxLineGeometry = extend(THREEBoxLineGeometry);

export function Simulation() {
  const { config } = useSimulation();
  const world = useWorld();
  const { gridSize } = config;
  const { gl, camera } = useThree();

  const movementSystem = useMemo(() => createMovementSystem(world, config), [config, world]);
  const selectionSystem = useMemo(() => createSelectionSystem(world), [world]);

  // Setup selection system click listener
  useEffect(() => {
    return selectionSystem.setupClickListener(gl.domElement);
  }, [selectionSystem, gl]);

  useFrame((_, delta) => {
    selectionSystem.system({ camera, canvas: gl.domElement });
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
