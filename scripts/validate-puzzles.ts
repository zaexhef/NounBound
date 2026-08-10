import { bundledPuzzles } from "../src/data/puzzles";
import {
  assertProductionEligible,
  validatePuzzleCollection,
} from "../src/features/content/validators";

function main() {
  const issues = validatePuzzleCollection(bundledPuzzles);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const production = assertProductionEligible(bundledPuzzles);

  console.log(`Validated ${bundledPuzzles.length} puzzles`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Warnings: ${warnings.length}`);
  console.log(
    `Production eligibility errors (expected for draft prototypes): ${production.length}`,
  );

  for (const issue of [...errors, ...warnings]) {
    console.log(`[${issue.severity}] ${issue.code} ${issue.puzzleId ?? ""}: ${issue.message}`);
  }

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
