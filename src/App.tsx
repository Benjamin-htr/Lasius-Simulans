import { MapControls } from "@react-three/drei";
import { Canvas, extend, useFrame, useLoader } from "@react-three/fiber";
import { createWorld, type Entity } from "koota";
import { WorldProvider, useQuery, useTrait } from "koota/react";
import { useControls } from "leva";
import { useMemo } from "react";
import * as THREE from "three";
import { BoxLineGeometry as THREEBoxLineGeometry } from "three/examples/jsm/Addons.js";
import "./App.css";
import { createMovementSystem } from "./core/systems/movement";
import { AntSettings, AntState } from "./core/traits/ant";
import { Position } from "./core/traits/position";
import { Rotation } from "./core/traits/rotation";
import { Velocity } from "./core/traits/velocity";
import { simulationConfig } from "./simulation_config";

const BoxLineGeometry = extend(THREEBoxLineGeometry);

// Create the world outside of components
const world = createWorld();

// Spawn an ant

for (let i = 0; i < 400; i++) {
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

function AntRenderer({ entity }: { entity: Entity }) {
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
type SimulationLoopProps = {
  config?: typeof simulationConfig;
};
function SimulationLoop({ config = simulationConfig }: SimulationLoopProps) {
  const movementSystem = useMemo(() => createMovementSystem(world, config), [config]);

  useFrame((_, delta) => {
    movementSystem(delta);
  });

  return null;
}

function Scene() {
  const ants = useQuery(AntSettings);
  const controls = useControls(simulationConfig);
  const { gridSize } = controls;

  return (
    <>
      <SimulationLoop config={controls} />
      <ambientLight intensity={Math.PI} />

      {ants.map((entity) => (
        <AntRenderer key={entity} entity={entity} />
      ))}

      <lineSegments>
        <BoxLineGeometry args={[gridSize.width, gridSize.height, 1, 1, 1]} />
        <lineBasicMaterial color="red" />
      </lineSegments>
    </>
  );
}

export function App() {
  return (
    <WorldProvider world={world}>
      <Canvas orthographic camera={{ zoom: 5, position: [0, 0, 40], up: [0, 0, 1], fov: 75 }} color="white">
        <MapControls enableRotate={false} zoomToCursor />
        <Scene />
      </Canvas>
    </WorldProvider>
  );
}
