import { extend, useFrame } from "@react-three/fiber";
import { useQuery } from "koota/react";
import { useControls } from "leva";
import { useMemo } from "react";
import { BoxLineGeometry as THREEBoxLineGeometry } from "three/examples/jsm/Addons.js";
import { createMovementSystem } from "../../core/systems/movement";
import { AntSettings } from "../../core/traits/ant";
import { Ant } from "../ant/ant";
import { simulationConfig } from "./simulation_config";
import { world } from "./world_init";

const BoxLineGeometry = extend(THREEBoxLineGeometry);

export function Simulation() {
  const ants = useQuery(AntSettings);
  const controlledConfig = useControls(simulationConfig);
  const { gridSize } = controlledConfig;

  const movementSystem = useMemo(() => createMovementSystem(world, controlledConfig), [controlledConfig]);

  useFrame((_, delta) => {
    movementSystem(delta);
  });

  return (
    <>
      <ambientLight intensity={Math.PI} />

      {ants.map((entity) => (
        <Ant key={entity} entity={entity} />
      ))}

      <lineSegments>
        <BoxLineGeometry args={[gridSize.width, gridSize.height, 1, 1, 1]} />
        <lineBasicMaterial color="red" />
      </lineSegments>
    </>
  );
}
