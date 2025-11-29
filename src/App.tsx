import { MapControls } from "@react-three/drei";
import { Canvas, extend } from "@react-three/fiber";
import { useControls } from "leva";
import { BoxLineGeometry as THREEBoxLineGeometry } from "three/examples/jsm/Addons.js";
import "./App.css";
import { simulationConfig } from "./simulation_config";

const BoxLineGeometry = extend(THREEBoxLineGeometry);

export function App() {
  const { gridSize, antSize } = useControls(simulationConfig);

  return (
    <Canvas orthographic camera={{ zoom: 5, position: [0, 0, 40], up: [0, 0, 1], fov: 75 }}>
      <MapControls enableRotate={false} zoomToCursor />
      <ambientLight intensity={Math.PI} />
      <mesh>
        <boxGeometry args={[antSize.width, antSize.length, antSize.height]} />
        <meshStandardMaterial color="mediumpurple" />
      </mesh>
      <lineSegments>
        <BoxLineGeometry args={[gridSize.width, gridSize.height, 1, 1, 1]} />
        <lineBasicMaterial color="red" />
      </lineSegments>
    </Canvas>
  );
}
