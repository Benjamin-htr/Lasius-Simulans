import { createContext, useContext } from "react";
import type { simulationConfig } from "./simulation_config";

interface SimulationContextValue {
  config: typeof simulationConfig;
}

export const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
