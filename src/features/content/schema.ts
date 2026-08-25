import { z } from "zod";

export const DifficultySchema = z.enum(["tutorial", "easy", "normal", "hard", "expert"]);
export type Difficulty = z.infer<typeof DifficultySchema>;

export const ReviewStatusSchema = z.enum([
  "draft",
  "fact_checked",
  "ambiguity_reviewed",
  "playtested",
  "approved",
  "published",
  "retired",
]);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

export const WorldSchema = z.enum([
  "celebrity",
  "automotive",
  "objects",
  "history",
  "crossover",
]);
export type PuzzleWorld = z.infer<typeof WorldSchema>;

export const PuzzleModeSchema = z.enum([
  "classic",
  "category_collision",
  "context_shift",
  "deceptive_noun",
  "chain_builder",
  "odd_noun_out",
  "timeline_sort",
  "reverse_puzzle",
  "daily_mystery",
]);
export type PuzzleMode = z.infer<typeof PuzzleModeSchema>;

const FourWordsSchema = z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]);

export const PuzzleGroupSchema = z.object({
  id: z.string().min(1),
  connection: z.string().min(1),
  words: FourWordsSchema,
  explanation: z.string().min(1),
  hints: FourWordsSchema,
});

export const CleverConnectionSchema = z.object({
  words: FourWordsSchema,
  connection: z.string().min(1),
  note: z.string().min(1),
});

export const EditorialSchema = z.object({
  status: ReviewStatusSchema,
  author: z.string().min(1),
  factChecker: z.string().optional(),
  ambiguityReviewer: z.string().optional(),
  sourceNotes: z.array(z.string()),
  playtests: z.number().int().nonnegative(),
});

export const NounBoundPuzzleSchema = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  contentVersion: z.number().int().positive(),
  title: z.string().min(1),
  world: WorldSchema,
  difficulty: DifficultySchema,
  mode: PuzzleModeSchema,
  groups: z.array(PuzzleGroupSchema).length(4),
  cleverConnections: z.array(CleverConnectionSchema),
  completionFact: z.string().optional(),
  chainNextPuzzleId: z.string().optional(),
  chainRevealNoun: z.string().optional(),
  editorial: EditorialSchema,
});

export type NounBoundPuzzle = z.infer<typeof NounBoundPuzzleSchema>;
export type PuzzleGroup = z.infer<typeof PuzzleGroupSchema>;

export function normalizeNoun(word: string): string {
  return word
    .normalize("NFKC")
    .trim()
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/\s+/g, " ");
}
