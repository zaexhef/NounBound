import {
  calculateScore,
  canSubmit,
  clearSelection,
  createBoardState,
  getActiveWords,
  requestHint,
  submitSelection,
  toggleCard,
  shouldShowOneAway,
} from "../../src/features/game/engine";
import { getPuzzleById } from "../../src/features/content/loader";

const puzzle = getPuzzleById("tutorial-001")!;

describe("game engine", () => {
  it("creates a shuffled board without mutating solution data", () => {
    const board = createBoardState(puzzle, { random: () => 0.5 });
    expect(board.shuffledWords).toHaveLength(16);
    expect(new Set(board.shuffledWords).size).toBe(16);
    expect(puzzle.groups[0]!.words).toEqual(["Apple", "Banana", "Orange", "Grape"]);
  });

  it("toggles selection and enforces four-card maximum", () => {
    let board = createBoardState(puzzle, { random: () => 0.1 });
    const words = getActiveWords(board);
    board = toggleCard(board, words[0]!);
    board = toggleCard(board, words[1]!);
    board = toggleCard(board, words[2]!);
    board = toggleCard(board, words[3]!);
    expect(board.selectedWords).toHaveLength(4);
    expect(canSubmit(board)).toBe(true);
    const blocked = toggleCard(board, words[4]!);
    expect(blocked.selectedWords).toHaveLength(4);
    board = toggleCard(board, words[0]!);
    expect(board.selectedWords).toHaveLength(3);
    board = clearSelection(board);
    expect(board.selectedWords).toHaveLength(0);
  });

  it("validates groups independent of selection order", () => {
    let board = createBoardState(puzzle, { random: () => 0.2 });
    const group = puzzle.groups[0]!.words;
    board = {
      ...board,
      selectedWords: [group[3]!, group[1]!, group[0]!, group[2]!],
    };
    board = submitSelection(board, puzzle);
    expect(board.solvedGroups).toHaveLength(1);
    expect(board.solvedGroups[0]!.groupId).toBe(puzzle.groups[0]!.id);
    expect(board.mistakesMade).toBe(0);
  });

  it("decrements mistakes and supports one-away through normal", () => {
    expect(shouldShowOneAway("normal")).toBe(true);
    expect(shouldShowOneAway("expert")).toBe(false);
    let board = createBoardState(puzzle, { random: () => 0.3 });
    const group = puzzle.groups[0]!.words;
    const other = puzzle.groups[1]!.words[0]!;
    board = {
      ...board,
      selectedWords: [group[0]!, group[1]!, group[2]!, other],
    };
    board = submitSelection(board, puzzle);
    expect(board.mistakesRemaining).toBe(2);
    expect(board.oneAwayVisible).toBe(true);
    expect(board.lastMessage).toBe("One away.");
  });

  it("wins after four correct groups and scores stars", () => {
    let board = createBoardState(puzzle, { random: () => 0.4 });
    for (const group of puzzle.groups) {
      board = { ...board, selectedWords: [...group.words] };
      board = submitSelection(board, puzzle);
    }
    expect(board.status).toBe("won");
    expect(board.score).toBe(1400);
    expect(board.stars).toBe(3);
  });

  it("loses after three incorrect submissions and reveals solution", () => {
    let board = createBoardState(puzzle, { random: () => 0.5 });
    for (let i = 0; i < 3; i += 1) {
      board = {
        ...board,
        selectedWords: [
          puzzle.groups[0]!.words[0]!,
          puzzle.groups[1]!.words[0]!,
          puzzle.groups[2]!.words[0]!,
          puzzle.groups[3]!.words[0]!,
        ],
      };
      board = submitSelection(board, puzzle);
    }
    expect(board.status).toBe("lost");
    expect(board.solvedGroups).toHaveLength(4);
    expect(board.score).toBe(0);
  });

  it("applies progressive hints", () => {
    let board = createBoardState(puzzle, { random: () => 0.6 });
    board = requestHint(board, puzzle);
    expect(board.hintsUsed).toBe(1);
    expect(board.hintState.stage).toBe(1);
    board = requestHint(board, puzzle);
    expect(board.lockedHintWords.length).toBeGreaterThan(0);
    board = requestHint(board, puzzle);
    expect(board.removedWords.length).toBeGreaterThan(0);
    board = requestHint(board, puzzle);
    expect(board.hintState.revealedLabel).toBeTruthy();
  });

  it("calculates scoring bonuses", () => {
    const perfect = calculateScore({
      mistakesMade: 0,
      hintsUsed: 0,
      categoriesNamedCorrectly: 2,
      isCategoryCollision: true,
      completed: true,
    });
    expect(perfect.total).toBe(1000 + 250 + 150 + 200 + 100);
    expect(perfect.stars).toBe(3);
    const twoStar = calculateScore({
      mistakesMade: 1,
      hintsUsed: 0,
      categoriesNamedCorrectly: 0,
      isCategoryCollision: false,
      completed: true,
    });
    expect(twoStar.stars).toBe(2);
  });
});
