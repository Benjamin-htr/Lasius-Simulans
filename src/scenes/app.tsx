import { MapControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { WorldProvider } from "koota/react";
import "./app.css";
import { Simulation } from "./simulation/simulation";
import { world } from "./simulation/world_init";

export function App() {
  return (
    <WorldProvider world={world}>
      <Canvas orthographic camera={{ zoom: 5, position: [0, 0, 40], up: [0, 0, 1], fov: 75 }} color="white">
        <MapControls enableRotate={false} zoomToCursor />
        <Simulation />
      </Canvas>
    </WorldProvider>
  );
}
