// src/pages/fractions/hooks/useFractionGame.js
import { useEffect, useRef, useState } from "react";
import { FRACTION_LEVELS } from "../../../data/fractionLevels";

const STORAGE_KEY = "sparvi_fraction_stats_v1";

function gcd(a, b) {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y !== 0) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

function simplify(n, d) {
  const g = gcd(n, d);
  return { n: n / g, d: d / g };
}

export default function useFractionGame() {
  const [levelIndex, setLevelIndex] = useState(0);
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [feedback, setFeedback] = useState("");
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [stats, setStats] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn("could not load fraction stats", e);
      return {};
    }
  });
  const [isCracking, setIsCracking] = useState(false);
  const [viewMode, setViewMode] = useState("whole"); // "whole" | "cracked" | "labeled"

  const crackTimeoutRef = useRef(null);

  // cleanup crack timeout
  useEffect(() => {
    return () => {
      if (crackTimeoutRef.current) {
        clearTimeout(crackTimeoutRef.current);
      }
    };
  }, []);

  const startLevel = (nextIndex) => {
    setLevelIndex(nextIndex);
    setViewMode("whole");
    setNumerator("");
    setDenominator("");
    setFeedback("");
    setResult(null);
    setIsCracking(false);
  };

  const level = FRACTION_LEVELS[levelIndex];
  const totalCells = level.rows * level.cols;
  const highlightCount = level.highlighted.length;
  const canonical = simplify(highlightCount, totalCells);

  const saveStats = (next) => {
    setStats(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn("could not save fraction stats", e);
    }
  };

  // check answer
  const handleSubmit = (e) => {
    e?.preventDefault?.();
    const num = parseInt(numerator, 10);
    const den = parseInt(denominator, 10);

    if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
      setFeedback("Fill in both boxes with a real fraction.");
      return;
    }

    setChecking(true);
    setFeedback("");

    const equivalent = num * canonical.d === den * canonical.n;
    const simplifiedInput = simplify(num, den);
    const isSimplified =
      simplifiedInput.n === canonical.n &&
      simplifiedInput.d === canonical.d;

    const levelStats = stats[level.id] || { plays: 0, correct: 0 };
    const nextStats = {
      ...stats,
      [level.id]: {
        plays: levelStats.plays + 1,
        correct: levelStats.correct + (equivalent ? 1 : 0),
      },
    };
    saveStats(nextStats);

    let message;
    if (!equivalent) {
      message =
        "Not yet. Count how many total pieces there are, and how many are purple.";
      // stay on cracked view, no labels
      setViewMode("cracked");
    } else if (!isSimplified) {
      message = `Nice! ${num}/${den} matches the purple area. In simplest form it is ${canonical.n}/${canonical.d}.`;
      setViewMode("labeled"); // show fraction labels on board
    } else {
      message = "Perfect! Look at the board: each region shows its fraction now.";
      setViewMode("labeled");
    }

    setResult({
      correct: equivalent,
      simplified: isSimplified,
      expected: canonical,
      stats: nextStats[level.id],
    });

    setFeedback(message);
    setChecking(false);
  };

  // hammer: crack first, then go next level after labels
  const handleHammerSmash = () => {
    // play crack animation
    setIsCracking(true);
    if (crackTimeoutRef.current) {
      clearTimeout(crackTimeoutRef.current);
    }
    crackTimeoutRef.current = setTimeout(
      () => setIsCracking(false),
      350
    );

    if (viewMode === "whole") {
      // first smash: reveal partitions
      setViewMode("cracked");
      return;
    }

    if (viewMode === "labeled") {
      // after labels are shown: move to next level, starting solid again
      const nextIndex =
        (levelIndex + 1) % FRACTION_LEVELS.length;
      startLevel(nextIndex);
      return;
    }

    // if already cracked but not labeled: just crack effect, no change
  };

  const resetInputs = () => {
    setNumerator("");
    setDenominator("");
    setFeedback("");
    setResult(null);
    // keep current viewMode (cracked / labeled)
  };

  const levelStats = stats[level.id];

  return {
    level,
    levelIndex,
    numerator,
    denominator,
    feedback,
    checking,
    result,
    levelStats,
    canonical,
    isCracking,
    viewMode,
    setNumerator,
    setDenominator,
    handleSubmit,
    handleHammerSmash,
    resetInputs,
  };
}
