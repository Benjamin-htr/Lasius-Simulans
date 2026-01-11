import { MapControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { WorldProvider } from "koota/react";
import { useControls } from "leva";
import { Perf } from "r3f-perf";
import { useMemo } from "react";
import "./app.css";
import { Simulation } from "./simulation/simulation";
import { simulationConfig } from "./simulation/simulation_config";
import { SimulationProvider } from "./simulation/simulation_provider";
import { initWorld } from "./simulation/world_init";

export function App() {
  const controlledConfig = useControls(simulationConfig);
  const world = useMemo(() => initWorld({ antCount: 5000 }), []);

  return (
    <WorldProvider world={world}>
      <SimulationProvider config={controlledConfig}>
        <Canvas
          orthographic
          camera={{ zoom: 5, position: [0, 0, 40], up: [0, 0, 1], near: 0.1, far: 10000 }}
          color="white"
        >
          <MapControls enableRotate={false} zoomToCursor />
          <Perf position="top-left" />
          <Simulation />
        </Canvas>
      </SimulationProvider>
    </WorldProvider>
  );
}
