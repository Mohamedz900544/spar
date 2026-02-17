// server/data/fractionLevels.js

// كل level عبارة عن grid متساوي المربعات، highlighted = خلايا الجزء الملون
// السيرفر بيحسب الكسر الصحيح من عدد الخلايا الملوّنة / عدد الخلايا الكلي

// src/data/fractionLevels.js

// Each level is a grid. "highlighted" are the purple cells indexes.
export const FRACTION_LEVELS = [
  {
    id: "quarters-basic",
    title: "Intro: quarters of a square",
    question: "What fraction is the purple part?",
    rows: 2,
    cols: 2,
    highlighted: [0], // 1 of 4 = 1/4
    cellColors: ["#a855f7", "#2563eb", "#ef4444", "#2563eb"],
    grade: "2",
    tags: ["quarters", "area model"]
  },
  {
    id: "half-rectangle",
    title: "Half of a rectangle",
    question: "What fraction of the rectangle is purple?",
    rows: 1,
    cols: 2,
    highlighted: [0], // 1 of 2 = 1/2
    cellColors: ["#a855f7", "#2563eb"],
    grade: "2",
    tags: ["halves"]
  },
  {
    id: "thirds-row",
    title: "Thirds in a row",
    question: "What fraction is purple?",
    rows: 1,
    cols: 3,
    highlighted: [0], // 1 of 3 = 1/3
    cellColors: ["#a855f7", "#f97316", "#f97316"],
    grade: "3",
    tags: ["thirds"]
  },
  {
    id: "two-thirds-grid",
    title: "Two thirds of a grid",
    question: "What fraction of this grid is purple?",
    rows: 3,
    cols: 3,
    highlighted: [0, 1, 2, 3, 4, 5], // 6 of 9 = 2/3
    cellColors: null,
    grade: "3",
    tags: ["thirds", "equivalent"]
  },
  {
    id: "five-sixteenths",
    title: "Five out of sixteen",
    question: "What fraction of this 4×4 grid is purple?",
    rows: 4,
    cols: 4,
    highlighted: [0, 1, 4, 5, 10], // 5 of 16
    cellColors: null,
    grade: "4",
    tags: ["non-simplified"]
  }
];


export default FRACTION_LEVELS;
