import type { ComponentType } from "react";
import { OreeDemo, OreeSocial } from "./oree";
import { SylveDemo } from "./atelier-sylve";
import { MeuleSocial } from "./la-meule";
import { NacreDemo } from "./nacre";

/** Pages des exemples de maquettes (entreprises fictives). */
export const demoPages: Record<string, ComponentType> = {
  oree: OreeDemo,
  "atelier-sylve": SylveDemo,
  nacre: NacreDemo,
};

/** Planches internes de visuels réseaux sociaux (sources des images d'illustration). */
export const demoSocial: Record<string, ComponentType> = {
  oree: OreeSocial,
  "la-meule": MeuleSocial,
};
