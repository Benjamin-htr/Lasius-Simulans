import { trait, type TraitRecord } from "koota";

export const Position = trait({ x: 0, y: 0, z: 0 });

export type PositionRecord = TraitRecord<typeof Position>;
