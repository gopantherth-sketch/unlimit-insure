import type { Insurer } from "@/lib/types";

// MOCK insurers. Fictional placeholders — no real company is represented.
// Replace with authorised insurers and their official logos (PROJECT_MASTER.md §30 "Insurer information").

export const insurers: Insurer[] = [
  { id: "ins-a", name: "บริษัทประกันตัวอย่าง A", shortName: "ตัวอย่าง A", accent: "#1016D1" },
  { id: "ins-b", name: "บริษัทประกันตัวอย่าง B", shortName: "ตัวอย่าง B", accent: "#0E7C66" },
  { id: "ins-c", name: "บริษัทประกันตัวอย่าง C", shortName: "ตัวอย่าง C", accent: "#B4460E" },
];
