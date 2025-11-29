import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import "./App.css";

export function App() {
  return (
    <Canvas>
      <OrbitControls />
      <mesh>
        <boxGeometry />
        <meshStandardMaterial />
        <perspectiveCamera />
      </mesh>
    </Canvas>
  );
}
