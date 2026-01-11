import { Instances } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { useWorld } from "koota/react";
import { useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { Position } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { ANT_COUNT } from "../simulation/simulation_config";
import { useSimulation } from "../simulation/simulation_context";

export function Ants() {
  const world = useWorld();
  const { config } = useSimulation();
  const loadedTexture = useLoader(THREE.TextureLoader, "lasius-niger.png");
  const instancesRef = useRef<THREE.InstancedMesh>(null);

  // Shared texture for all ants - rotate by 90 degrees
  const texture = useMemo(() => {
    const tex = loadedTexture.clone();
    tex.rotation = -Math.PI / 2;
    tex.center.set(0.5, 0.5);
    tex.needsUpdate = true;
    return tex;
  }, [loadedTexture]);

  const tempObject = useMemo(() => new THREE.Object3D(), []);

  // Update all instances directly each frame (no React re-renders!)
  useFrame(() => {
    if (!instancesRef.current) return;

    // Disable frustum culling
    instancesRef.current.frustumCulled = false;

    const entities = world.query(Position, Rotation);
    let index = 0;

    entities.updateEach(([position, rotation]) => {
      tempObject.position.set(position.x, position.y, position.z);
      tempObject.rotation.z = rotation.angle;

      tempObject.updateMatrix();

      instancesRef.current!.setMatrixAt(index, tempObject.matrix);
      index++;
    });

    // Tell Three.js to update the instance matrices
    instancesRef.current.instanceMatrix.needsUpdate = true;
    instancesRef.current.count = index;
  });

  return (
    <Instances ref={instancesRef} limit={ANT_COUNT}>
      <boxGeometry args={[config.antSize.length, config.antSize.length * 0.816, config.antSize.height]} />
      <meshStandardMaterial map={texture} transparent alphaTest={0.001} />
    </Instances>
  );
}
