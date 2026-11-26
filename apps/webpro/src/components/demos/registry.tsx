import type { ComponentType } from "react";
import { OreeDemo, OreeSocial } from "./oree";
import { SylveDemo } from "./atelier-sylve";
import { MeuleDemo, MeuleSocial } from "./la-meule";
import { NacreDemo } from "./nacre";

export const demoPages: Record<string, ComponentType> = {
  oree: OreeDemo,
  "atelier-sylve": SylveDemo,
  "la-meule": MeuleDemo,
  nacre: NacreDemo,
};

export const demoSocial: Record<string, ComponentType> = {
  oree: OreeSocial,
  "la-meule": MeuleSocial,
};
