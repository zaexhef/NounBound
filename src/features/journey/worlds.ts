import { PuzzleWorld } from "../content/schema";

export type JourneyNodeType =
  | "arrival"
  | "standard"
  | "challenge"
  | "restoration"
  | "finale"
  | "connection";

export interface JourneyNode {
  id: string;
  type: JourneyNodeType;
  title: string;
  puzzleId?: string;
  unlockAfter?: string[];
  restorationWeight?: number;
  connectsToWorld?: PuzzleWorld;
}

export interface JourneyWorldDefinition {
  id: PuzzleWorld;
  name: string;
  tagline: string;
  nodes: JourneyNode[];
  nextWorld?: PuzzleWorld;
}

/**
 * Architecture supports full world structure. Prototype content reuses the
 * smaller playable puzzle set across nodes.
 */
export const journeyWorlds: JourneyWorldDefinition[] = [
  {
    id: "celebrity",
    name: "Celebrity Spotlight",
    tagline: "Names that echo under museum lights.",
    nextWorld: "automotive",
    nodes: [
      { id: "cel-arrival", type: "arrival", title: "Spotlight Foyer", puzzleId: "tutorial-001" },
      {
        id: "cel-1",
        type: "standard",
        title: "Screen Legends",
        puzzleId: "easy-001",
        unlockAfter: ["cel-arrival"],
      },
      {
        id: "cel-2",
        type: "standard",
        title: "Stage and Screen",
        puzzleId: "normal-001",
        unlockAfter: ["cel-1"],
      },
      {
        id: "cel-challenge",
        type: "challenge",
        title: "Red Carpet Collision",
        puzzleId: "collision-001",
        unlockAfter: ["cel-2"],
      },
      {
        id: "cel-restore",
        type: "restoration",
        title: "Restore the Marquee",
        unlockAfter: ["cel-challenge"],
        restorationWeight: 1,
      },
      {
        id: "cel-finale",
        type: "finale",
        title: "Encore Archive",
        puzzleId: "normal-001",
        unlockAfter: ["cel-restore"],
      },
      {
        id: "cel-connection",
        type: "connection",
        title: "To Motor City",
        unlockAfter: ["cel-finale"],
        connectsToWorld: "automotive",
      },
    ],
  },
  {
    id: "automotive",
    name: "Motor City Garage",
    tagline: "Steel, speed, and signal red.",
    nextWorld: "objects",
    nodes: [
      { id: "auto-arrival", type: "arrival", title: "Bay Doors", puzzleId: "easy-002" },
      {
        id: "auto-1",
        type: "standard",
        title: "Garage Basics",
        puzzleId: "easy-002",
        unlockAfter: ["auto-arrival"],
      },
      {
        id: "auto-2",
        type: "standard",
        title: "Detroit Lines",
        puzzleId: "normal-002",
        unlockAfter: ["auto-1"],
      },
      {
        id: "auto-challenge",
        type: "challenge",
        title: "Assembly Line Trial",
        puzzleId: "collision-001",
        unlockAfter: ["auto-2"],
      },
      {
        id: "auto-restore",
        type: "restoration",
        title: "Restore the Lift",
        unlockAfter: ["auto-challenge"],
        restorationWeight: 1,
      },
      {
        id: "auto-finale",
        type: "finale",
        title: "Championship Lap",
        puzzleId: "normal-002",
        unlockAfter: ["auto-restore"],
      },
      {
        id: "auto-connection",
        type: "connection",
        title: "To House of Objects",
        unlockAfter: ["auto-finale"],
        connectsToWorld: "objects",
      },
    ],
  },
  {
    id: "objects",
    name: "House of Objects",
    tagline: "Ordinary things, extraordinary links.",
    nextWorld: "history",
    nodes: [
      { id: "obj-arrival", type: "arrival", title: "Front Hall", puzzleId: "easy-003" },
      {
        id: "obj-1",
        type: "standard",
        title: "Around the House",
        puzzleId: "easy-003",
        unlockAfter: ["obj-arrival"],
      },
      {
        id: "obj-2",
        type: "standard",
        title: "Double Meanings",
        puzzleId: "hard-001",
        unlockAfter: ["obj-1"],
      },
      {
        id: "obj-challenge",
        type: "challenge",
        title: "Attic Ambiguity",
        puzzleId: "hard-001",
        unlockAfter: ["obj-2"],
      },
      {
        id: "obj-restore",
        type: "restoration",
        title: "Restore the Exhibit Cases",
        unlockAfter: ["obj-challenge"],
        restorationWeight: 1,
      },
      {
        id: "obj-finale",
        type: "finale",
        title: "Curator's Choice",
        puzzleId: "easy-003",
        unlockAfter: ["obj-restore"],
      },
      {
        id: "obj-connection",
        type: "connection",
        title: "To History Vault",
        unlockAfter: ["obj-finale"],
        connectsToWorld: "history",
      },
    ],
  },
  {
    id: "history",
    name: "History Vault",
    tagline: "Parchment, bronze, and charcoal memory.",
    nodes: [
      { id: "hist-arrival", type: "arrival", title: "Vault Door", puzzleId: "tutorial-002" },
      {
        id: "hist-1",
        type: "standard",
        title: "Vault Entries",
        puzzleId: "normal-003",
        unlockAfter: ["hist-arrival"],
      },
      {
        id: "hist-2",
        type: "standard",
        title: "Watch for Overlaps",
        puzzleId: "tutorial-002",
        unlockAfter: ["hist-1"],
      },
      {
        id: "hist-challenge",
        type: "challenge",
        title: "Timeline Pressure",
        puzzleId: "hard-001",
        unlockAfter: ["hist-2"],
      },
      {
        id: "hist-restore",
        type: "restoration",
        title: "Restore the Archive Wing",
        unlockAfter: ["hist-challenge"],
        restorationWeight: 1,
      },
      {
        id: "hist-finale",
        type: "finale",
        title: "Living Archive",
        puzzleId: "normal-003",
        unlockAfter: ["hist-restore"],
      },
    ],
  },
];

export function getWorld(id: PuzzleWorld): JourneyWorldDefinition | undefined {
  return journeyWorlds.find((w) => w.id === id);
}

export function isNodeUnlocked(
  node: JourneyNode,
  completedNodeIds: string[],
): boolean {
  if (!node.unlockAfter || node.unlockAfter.length === 0) return true;
  return node.unlockAfter.every((id) => completedNodeIds.includes(id));
}
