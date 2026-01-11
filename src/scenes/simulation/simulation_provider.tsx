import { type ReactNode } from "react";
import { type simulationConfig } from "./simulation_config";
import { SimulationContext } from "./simulation_context";

interface SimulationProviderProps {
  config: typeof simulationConfig;
  children: ReactNode;
}

export function SimulationProvider({ config, children }: SimulationProviderProps) {
  return <SimulationContext.Provider value={{ config }}>{children}</SimulationContext.Provider>;
}
