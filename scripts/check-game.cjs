const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const c = require("../js/game-core");
const data = c.validateLibrary(
  JSON.parse(fs.readFileSync(path.join(__dirname, "../riddles.json"))),
);
const today = "2026-09-22";
const puzzle = c.dailyPuzzle(data, today);
assert.equal(puzzle.date, today);
assert.equal(puzzle.scheduled, false);
assert.deepEqual(c.dailyPuzzle(data, today), puzzle);
assert.equal(c.dailyPuzzle(data, "2025-12-01").sourceDate, "2025-12-01");
assert.equal(c.dailyPuzzle(data, "2025-11-30").sourceDate, "2025-12-31");
assert.equal(c.dayNumber("2026-03-09") - c.dayNumber("2026-03-08"), 1);
assert.equal(c.dayNumber("2026-11-02") - c.dayNumber("2026-11-01"), 1);
assert.equal(c.isCorrect("  A Christmas    Tree! ", ["Christmas tree"]), true);
assert.equal(c.isCorrect("New Year's Eve", ["new year’s eve"]), true);
assert.equal(c.isCorrect("the moons", ["moon"]), true);
assert.equal(c.isCorrect("some", ["moon"]), false);
assert.equal(c.isCorrect("moonlight", ["moon"]), false);
for (const [date, riddle] of Object.entries(data)) {
  for (const answer of riddle.answer)
    assert.equal(
      c.isCorrect(` The ${answer.toUpperCase()}! `, riddle.answer),
      true,
      `${date}: rejected valid answer`,
    );
}
let state = c.newGame(puzzle);
let result = c.submitGuess(state, "   ", puzzle.answer);
assert.deepEqual(result.state, state);
result = c.submitGuess(state, "wrong one", puzzle.answer);
state = result.state;
assert.equal(state.guesses.length, 1);
assert.deepEqual(
  c.restoreGame(JSON.parse(JSON.stringify(state)), puzzle),
  state,
);
assert.equal(
  c.submitGuess(state, "THE WRONG ONE!", puzzle.answer).message,
  "duplicate",
);
state = c.submitGuess(state, "wrong two", puzzle.answer).state;
state = c.submitGuess(state, "wrong three", puzzle.answer).state;
assert.equal(state.status, "lost");
assert.equal(
  c.submitGuess(state, puzzle.answer[0], puzzle.answer).message,
  "finished",
);
const won = c.submitGuess(
  c.newGame(puzzle),
  puzzle.answer[0],
  puzzle.answer,
).state;
assert.equal(won.status, "won");
assert.equal(
  c.restoreGame(won, c.dailyPuzzle(data, "2026-09-23")).status,
  "playing",
);
assert.equal(
  c.restoreGame({ ...won, guesses: new Array(5).fill("x") }, puzzle).status,
  "playing",
);
assert.equal(
  c.visibleStreak({ streak: 4, lastPlayed: "2026-09-20" }, today),
  0,
);
assert.deepEqual(
  c.recordCompletion({ streak: 4, lastPlayed: "2026-09-21" }, today),
  { streak: 5, lastPlayed: today },
);
assert.deepEqual(c.recordCompletion({ streak: 5, lastPlayed: today }, today), {
  streak: 5,
  lastPlayed: today,
});
assert.deepEqual(
  c.recordCompletion({ streak: 5, lastPlayed: "2026-09-19" }, today),
  { streak: 1, lastPlayed: today },
);
assert.throws(() => c.validateLibrary({}), /Invalid/);
assert.throws(
  () =>
    c.validateLibrary({ "2026-09-22": { riddle: "x", answer: [], hint: "x" } }),
  /Invalid/,
);
console.log(
  `PASS: ${Object.keys(data).length} scheduled riddles, answer variants, daily rotation, saved attempts, completion, date boundaries, and streak rules.`,
);
