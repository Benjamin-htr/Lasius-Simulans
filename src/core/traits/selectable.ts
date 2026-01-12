import { trait, type TraitRecord } from "koota";

// Trait for entities that can be selected via click
export const Selectable = trait({
  isSelected: false,
  radius: 2.0, // Click detection radius in world units
});

export type SelectableRecord = TraitRecord<typeof Selectable>;
