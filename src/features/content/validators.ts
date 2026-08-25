import {
  NounBoundPuzzle,
  NounBoundPuzzleSchema,
  normalizeNoun,
  ReviewStatus,
} from "./schema";

export type ValidationSeverity = "error" | "warning";

export interface ValidationIssue {
  severity: ValidationSeverity;
  code: string;
  message: string;
  puzzleId?: string;
}

const PRODUCTION_ELIGIBLE: ReviewStatus[] = ["approved", "published"];

export function validatePuzzle(puzzle: unknown): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const parsed = NounBoundPuzzleSchema.safeParse(puzzle);

  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      issues.push({
        severity: "error",
        code: "SCHEMA_INVALID",
        message: `${issue.path.join(".")}: ${issue.message}`,
        puzzleId:
          typeof puzzle === "object" &&
          puzzle !== null &&
          "id" in puzzle &&
          typeof (puzzle as { id: unknown }).id === "string"
            ? (puzzle as { id: string }).id
            : undefined,
      });
    }
    return issues;
  }

  const p = parsed.data;
  const allWords = p.groups.flatMap((g) => g.words);
  const normalized = allWords.map(normalizeNoun);

  if (allWords.length !== 16) {
    issues.push({
      severity: "error",
      code: "WORD_COUNT",
      message: `Expected 16 words, found ${allWords.length}`,
      puzzleId: p.id,
    });
  }

  const uniqueVisible = new Set(allWords);
  if (uniqueVisible.size !== allWords.length) {
    issues.push({
      severity: "error",
      code: "DUPLICATE_NOUN",
      message: "Visible nouns must be unique",
      puzzleId: p.id,
    });
  }

  const uniqueNormalized = new Set(normalized);
  if (uniqueNormalized.size !== normalized.length) {
    issues.push({
      severity: "error",
      code: "NORMALIZED_DUPLICATE",
      message: "Normalized nouns collide (case/spacing)",
      puzzleId: p.id,
    });
  }

  const groupIds = p.groups.map((g) => g.id);
  if (new Set(groupIds).size !== groupIds.length) {
    issues.push({
      severity: "error",
      code: "DUPLICATE_GROUP_ID",
      message: "Group IDs must be unique within a puzzle",
      puzzleId: p.id,
    });
  }

  for (const group of p.groups) {
    if (new Set(group.words.map(normalizeNoun)).size !== 4) {
      issues.push({
        severity: "error",
        code: "GROUP_INTERNAL_DUPLICATE",
        message: `Group ${group.id} has duplicate words`,
        puzzleId: p.id,
      });
    }
    for (const hint of group.hints) {
      if (!hint.trim()) {
        issues.push({
          severity: "error",
          code: "MISSING_HINT",
          message: `Group ${group.id} has an empty hint`,
          puzzleId: p.id,
        });
      }
    }
    if (!group.explanation.trim()) {
      issues.push({
        severity: "error",
        code: "MISSING_EXPLANATION",
        message: `Group ${group.id} is missing an explanation`,
        puzzleId: p.id,
      });
    }
  }

  // Accidental alternate-group heuristic: warn when cleverConnections empty
  // but editorial notes mention ambiguity without review.
  if (
    p.cleverConnections.length === 0 &&
    p.editorial.sourceNotes.some((n) => /ambiguous|overlap|alternate/i.test(n))
  ) {
    issues.push({
      severity: "warning",
      code: "AMBIGUITY_REVIEW_NEEDED",
      message: "Ambiguity mentioned in sources but no Clever Connections recorded",
      puzzleId: p.id,
    });
  }

  if (
    (p.editorial.status === "published" || p.editorial.status === "approved") &&
    p.editorial.sourceNotes.length === 0 &&
    p.groups.some((g) => /president|invent|date|born|founded/i.test(g.explanation))
  ) {
    issues.push({
      severity: "warning",
      code: "MISSING_SOURCE_NOTES",
      message: "Factual claims should include source notes before approval",
      puzzleId: p.id,
    });
  }

  return issues;
}

export function validatePuzzleCollection(puzzles: NounBoundPuzzle[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const ids = new Set<string>();

  for (const puzzle of puzzles) {
    issues.push(...validatePuzzle(puzzle));
    if (ids.has(puzzle.id)) {
      issues.push({
        severity: "error",
        code: "DUPLICATE_PUZZLE_ID",
        message: `Duplicate puzzle id: ${puzzle.id}`,
        puzzleId: puzzle.id,
      });
    }
    ids.add(puzzle.id);
  }

  return issues;
}

export function assertProductionEligible(puzzles: NounBoundPuzzle[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const puzzle of puzzles) {
    if (!PRODUCTION_ELIGIBLE.includes(puzzle.editorial.status)) {
      issues.push({
        severity: "error",
        code: "UNAPPROVED_PRODUCTION_CONTENT",
        message: `Puzzle ${puzzle.id} has status ${puzzle.editorial.status} and cannot ship as production content`,
        puzzleId: puzzle.id,
      });
    }
  }
  return issues;
}

export function isPlayableInDevelopment(puzzle: NounBoundPuzzle): boolean {
  return puzzle.editorial.status !== "retired";
}

export function parsePuzzle(raw: unknown): NounBoundPuzzle {
  return NounBoundPuzzleSchema.parse(raw);
}
