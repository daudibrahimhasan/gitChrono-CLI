export const BYTES_PER_LINE: Record<string, number> = {
  Python: 35,
  JavaScript: 40,
  TypeScript: 42,
  Java: 45,
  "C++": 38,
  C: 35,
  Go: 40,
  Ruby: 35,
  PHP: 40,
  HTML: 50,
  CSS: 45,
  SQL: 30,
};

export const MULTIPLIERS: Record<string, number> = {
  Python: 1.0,
  JavaScript: 1.2,
  Java: 1.5,
  "C++": 2.0,
  C: 2.2,
  SQL: 0.8,
  HTML: 0.6,
  CSS: 0.6,
};

export function calculateLOC(languages: Record<string, number>) {
  const loc: Record<string, number> = {};
  for (const [lang, bytes] of Object.entries(languages)) {
    const ratio = BYTES_PER_LINE[lang] || BYTES_PER_LINE.default || 40;
    loc[lang] = Math.round(bytes / ratio);
  }
  return loc;
}

export function calculateWeightedTime(loc: Record<string, number>) {
  const weighted: Record<string, number> = {};
  let totalWeightedLOC = 0;

  for (const [lang, count] of Object.entries(loc)) {
    const multiplier = MULTIPLIERS[lang] || MULTIPLIERS.default || 1.0;
    const weightedCount = count * multiplier;
    weighted[lang] = weightedCount;
    totalWeightedLOC += weightedCount;
  }

  // Industry average: 30 LOC/day (middle estimate)
  // 8 hours/day
  const totalHours = (totalWeightedLOC / 30) * 8;

  const breakdown: Record<string, { loc: number; hours: number; percentage: number }> = {};
  for (const [lang, weightedCount] of Object.entries(weighted)) {
    const percentage = (weightedCount / totalWeightedLOC) * 100;
    const hours = (weightedCount / 30) * 8;
    breakdown[lang] = {
      loc: loc[lang],
      hours,
      percentage,
    };
  }

  return {
    totalHours,
    totalLoc: Math.round(Object.values(loc).reduce((a, b) => a + b, 0)),
    breakdown,
  };
}

export function formatTime(totalHours: number) {
  const hours = Math.floor(totalHours);
  const mins = Math.round((totalHours - hours) * 60);
  return `${hours} hrs ${mins} mins`;
}

export function generateASCIIBar(percentage: number, maxLength = 20) {
  const barLength = Math.round((percentage / 100) * maxLength);
  const filledBar = "█".repeat(barLength);
  const emptyBar = "░".repeat(Math.max(0, maxLength - barLength));
  return `${filledBar}${emptyBar}`;
}
