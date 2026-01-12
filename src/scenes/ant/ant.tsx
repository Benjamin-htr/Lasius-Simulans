import { Instances } from "@react-three/drei";
import { useFrame, useLoader, type Color } from "@react-three/fiber";
import { useWorld } from "koota/react";
import { forwardRef, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { Position, type PositionRecord } from "../../core/traits/position";
import { Rotation } from "../../core/traits/rotation";
import { Selectable, type SelectableRecord } from "../../core/traits/selectable";
import { ANT_COUNT, ANT_MAX_Z } from "../simulation/simulation_config";
import { useSimulation } from "../simulation/simulation_context";

export function Ants() {
  const world = useWorld();
  const { config } = useSimulation();
  const loadedTexture = useLoader(THREE.TextureLoader, "lasius-niger.png");
  const instancesRef = useRef<THREE.InstancedMesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

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

    let currentlySelected: SelectedAnt = null;

    const entities = world.query(Position, Rotation, Selectable);

    entities.updateEach(([position, rotation, selectable], _, index) => {
      tempObject.position.set(position.x, position.y, position.z);
      tempObject.rotation.z = rotation.angle;

      if (selectable.isSelected) {
        currentlySelected = { selectable, position };
      }

      tempObject.updateMatrix();
      instancesRef.current!.setMatrixAt(index, tempObject.matrix);
    });

    // Update selected ant
    updateSelectedAnt(currentlySelected, ringRef);
    currentlySelected = null;

    // Tell Three.js to update the instance matrices
    instancesRef.current.instanceMatrix.needsUpdate = true;
    instancesRef.current.count = ANT_COUNT;
  });

  return (
    <>
      <Instances ref={instancesRef} limit={ANT_COUNT} count={ANT_COUNT}>
        <boxGeometry args={[config.antSize.length, config.antSize.length * 0.816, config.antSize.height]} />
        <meshStandardMaterial map={texture} transparent alphaTest={0.001} />
      </Instances>
      <OutlinedRing innerRadius={config.antSize.length * 0.7} thickness={0.3} color="#00ff00" ref={ringRef} />
    </>
  );
}

type SelectedAnt = { selectable: SelectableRecord; position: PositionRecord } | null;

function updateSelectedAnt(selectedAnt: SelectedAnt | null, ringRef: React.RefObject<THREE.Mesh | null>) {
  if (!selectedAnt && ringRef.current) {
    // Hide the ring if no ant is selected
    ringRef.current.visible = false;
    return;
  }

  if (selectedAnt?.selectable.isSelected && ringRef.current) {
    ringRef.current.position.set(selectedAnt.position.x, selectedAnt.position.y, ANT_MAX_Z + 1);
    ringRef.current.scale.set(1, 1, 1);

    // Make the ring visible
    ringRef.current.visible = true;
  }
}

type OutlinedRingProps = {
  innerRadius: number;
  thickness?: number;
  color?: Color;
} & React.ComponentPropsWithoutRef<"mesh">;

const OutlinedRing = forwardRef<THREE.Mesh, OutlinedRingProps>(
  ({ thickness = 0.1, color = "#00ff00", innerRadius = 1 }, ref) => {
    return (
      <mesh ref={ref}>
        <ringGeometry args={[innerRadius, innerRadius + thickness, 32]} />
        <meshBasicMaterial color={color} side={THREE.FrontSide} transparent opacity={0.8} />
      </mesh>
    );
  }
);
