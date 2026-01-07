export const BYTES_PER_LINE = {
    Python: 35,
    JavaScript: 40,
    TypeScript: 42,
    Java: 45,
    "C++": 38,
    C: 35,
    Go: 40,
    Rust: 42,
    Ruby: 35,
    PHP: 40,
    Swift: 40,
    Kotlin: 42,
    Scala: 45,
    HTML: 50,
    CSS: 45,
    SCSS: 45,
    SQL: 30,
    Shell: 30,
    Bash: 30,
    PowerShell: 35,
    Dockerfile: 25,
    YAML: 30,
    JSON: 40,
    Markdown: 60,
};
export const COMPLEXITY_MULTIPLIERS = {
    // Systems programming (complex)
    "C++": 2.0,
    C: 2.2,
    Rust: 1.8,
    Assembly: 3.0,
    // Compiled languages (moderate-complex)
    Java: 1.5,
    Go: 1.3,
    Swift: 1.4,
    Kotlin: 1.3,
    Scala: 1.6,
    // Scripting/interpreted (moderate)
    Python: 1.0,
    JavaScript: 1.2,
    TypeScript: 1.3,
    Ruby: 1.0,
    PHP: 1.1,
    Perl: 1.2,
    // Markup/config (simple)
    HTML: 0.5,
    CSS: 0.5,
    SCSS: 0.6,
    SQL: 0.8,
    Markdown: 0.3,
    YAML: 0.4,
    JSON: 0.2,
    Shell: 0.7,
    Dockerfile: 0.5,
};
export function calculateAnalysis(languageBytes, repoCount) {
    const languages = {};
    let totalLoc = 0;
    let totalWeightedLoc = 0;
    // Calculate LOC and weighted LOC for each language
    for (const [lang, bytes] of Object.entries(languageBytes)) {
        const bytesPerLine = BYTES_PER_LINE[lang] || 40;
        const multiplier = COMPLEXITY_MULTIPLIERS[lang] || 1.0;
        const loc = Math.round(bytes / bytesPerLine);
        const weightedLoc = loc * multiplier;
        languages[lang] = {
            bytes,
            loc,
            weightedLoc,
            hours: 0, // Will calculate after we have total
            percentage: 0,
        };
        totalLoc += loc;
        totalWeightedLoc += weightedLoc;
    }
    // Industry average: ~30 LOC/day for production code, 8 hours/day
    const totalHours = (totalWeightedLoc / 30) * 8;
    // Calculate percentages and hours for each language
    for (const lang of Object.keys(languages)) {
        languages[lang].percentage = (languages[lang].weightedLoc / totalWeightedLoc) * 100;
        languages[lang].hours = (languages[lang].weightedLoc / totalWeightedLoc) * totalHours;
    }
    return {
        languages,
        totalLoc,
        totalWeightedLoc,
        totalHours,
        repoCount,
    };
}
export function formatTime(hours) {
    if (hours < 1) {
        return `${Math.round(hours * 60)} mins`;
    }
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0)
        return `${h} hrs`;
    return `${h} hrs ${m} mins`;
}
export function generateASCIIBar(percentage, maxLength = 20) {
    const filled = Math.round((percentage / 100) * maxLength);
    const empty = maxLength - filled;
    return "█".repeat(filled) + "░".repeat(empty);
}
