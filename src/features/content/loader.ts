import { bundledPuzzles, dailyMysteryReservePuzzleId } from "@/data/puzzles";
import { NounBoundPuzzle } from "./schema";
import {
  isPlayableInDevelopment,
  validatePuzzleCollection,
  ValidationIssue,
} from "./validators";

export function getAllBundledPuzzles(): NounBoundPuzzle[] {
  return bundledPuzzles;
}

export function getPlayablePuzzles(): NounBoundPuzzle[] {
  return bundledPuzzles.filter(isPlayableInDevelopment);
}

export function getPuzzleById(id: string): NounBoundPuzzle | undefined {
  return bundledPuzzles.find((p) => p.id === id);
}

export function getPuzzlesByWorld(world: NounBoundPuzzle["world"]): NounBoundPuzzle[] {
  return getPlayablePuzzles().filter((p) => p.world === world);
}

export function getPuzzlesByDifficulty(
  difficulty: NounBoundPuzzle["difficulty"],
): NounBoundPuzzle[] {
  return getPlayablePuzzles().filter((p) => p.difficulty === difficulty);
}

export function getDailyMysteryPuzzle(now = new Date()): NounBoundPuzzle {
  // Deterministic local daily selection from playable set; offline-safe.
  const playable = getPlayablePuzzles().filter((p) => p.difficulty !== "tutorial");
  const seed =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const index = seed % Math.max(playable.length, 1);
  return playable[index] ?? getPuzzleById(dailyMysteryReservePuzzleId)!;
}

export function getDailyFallbackPuzzle(): NounBoundPuzzle {
  return getPuzzleById(dailyMysteryReservePuzzleId) ?? bundledPuzzles[0]!;
}

export function validateBundledContent(): ValidationIssue[] {
  return validatePuzzleCollection(bundledPuzzles);
}

export function getTutorialPuzzles(): NounBoundPuzzle[] {
  return getPuzzlesByDifficulty("tutorial");
}
