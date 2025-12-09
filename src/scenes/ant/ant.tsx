import { useLoader } from "@react-three/fiber";
import { type Entity } from "koota";
import { useTrait } from "koota/react";
import { useControls } from "leva";
import { useMemo } from "react";
import * as THREE from "three";
import { Position } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { simulationConfig } from "../simulation/simulation_config";

export function Ant({ entity }: { entity: Entity }) {
  const position = useTrait(entity, Position);
  const rotation = useTrait(entity, Rotation);
  const { antSize } = useControls(simulationConfig);
  const loadedTexture = useLoader(THREE.TextureLoader, "lasius-niger.png");

  // Rotate texture by 90 degrees and adjust aspect ratio
  const texture = useMemo(() => {
    const tex = loadedTexture.clone();
    tex.rotation = -Math.PI / 2;
    tex.center.set(0.5, 0.5);
    // Adjust repeat to match geometry aspect ratio (length/width = 3/1)
    tex.repeat.set(1, antSize.length / antSize.width);
    tex.needsUpdate = true;
    return tex;
  }, [loadedTexture, antSize.length, antSize.width]);

  if (!position || !rotation) return null;

  return (
    <mesh position={[position.x, position.y, position.z]} rotation={[0, 0, rotation.angle]}>
      <boxGeometry args={[antSize.length, antSize.width, antSize.height]} />
      <meshStandardMaterial map={texture} transparent />
    </mesh>
  );
}
