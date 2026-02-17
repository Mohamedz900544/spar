// server/routes/fractions.js
import express from 'express'
// const express = require("express");
// const levels = require("../data/fractionLevels");
import levels from '../data/fractionLevels.js'

const router = express.Router();

// in-memory stats
const levelStats = {};
levels.forEach((lvl) => {
  levelStats[lvl.id] = { plays: 0, correct: 0 };
});

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

function simplifyFraction(n, d) {
  const g = gcd(n, d);
  return { numerator: n / g, denominator: d / g };
}

function getLevelById(id) {
  return levels.find((lvl) => lvl.id === id);
}

function getCanonicalFraction(level) {
  const totalCells = level.rows * level.cols;
  const highlightCount = level.highlighted.length;
  return simplifyFraction(highlightCount, totalCells);
}

// GET /api/fractions/levels  – قائمة بكل المستويات
router.get("/levels", (req, res) => {
  const response = levels.map((lvl) => {
    const canonical = getCanonicalFraction(lvl);
    return {
      id: lvl.id,
      title: lvl.title,
      question: lvl.question,
      rows: lvl.rows,
      cols: lvl.cols,
      grade: lvl.grade,
      tags: lvl.tags,
      previewHighlightRatio: `${canonical.numerator}/${canonical.denominator}`,
      stats: levelStats[lvl.id] || { plays: 0, correct: 0 }
    };
  });

  res.json(response);
});

// GET /api/fractions/levels/:id  – تفاصيل level واحد
router.get("/levels/:id", (req, res) => {
  const level = getLevelById(req.params.id);
  if (!level) {
    return res.status(404).json({ error: "Level not found" });
  }

  const canonical = getCanonicalFraction(level);

  res.json({
    id: level.id,
    title: level.title,
    question: level.question,
    rows: level.rows,
    cols: level.cols,
    highlighted: level.highlighted,
    cellColors: level.cellColors,
    grade: level.grade,
    tags: level.tags,
    // ممكن تستخدم solution في teacher mode بس
    solution: canonical
  });
});

// POST /api/fractions/attempt  – تصحيح إجابة الطالب
router.post("/attempt", (req, res) => {
  const { levelId, numerator, denominator } = req.body || {};
  const level = getLevelById(levelId);

  if (!level) {
    return res.status(400).json({ error: "Unknown levelId" });
  }

  const num = parseInt(numerator, 10);
  const den = parseInt(denominator, 10);

  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) {
    return res.status(400).json({ error: "Invalid fraction" });
  }

  const canonical = getCanonicalFraction(level);
  const equivalent =
    num * canonical.denominator === den * canonical.numerator;

  const simplifiedInput = simplifyFraction(num, den);
  const isSimplified =
    simplifiedInput.numerator === canonical.numerator &&
    simplifiedInput.denominator === canonical.denominator;

  levelStats[level.id].plays += 1;
  if (equivalent) levelStats[level.id].correct += 1;

  let message;
  if (!equivalent) {
    message =
      "Not yet. Think: how many equal purple pieces make the whole shape?";
  } else if (!isSimplified) {
    message = `Good job! Your fraction is equivalent. In simplest form it is ${canonical.numerator}/${canonical.denominator}.`;
  } else {
    message = "Perfect! You wrote the fraction in simplest form.";
  }

  res.json({
    correct: equivalent,
    simplified: isSimplified,
    expected: canonical,
    stats: levelStats[level.id],
    message
  });
});

// GET /api/fractions/stats – ملخص الأداء
router.get("/stats", (req, res) => {
  res.json(levelStats);
});

export default router
