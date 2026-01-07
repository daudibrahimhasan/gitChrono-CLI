export declare const BYTES_PER_LINE: Record<string, number>;
export declare const COMPLEXITY_MULTIPLIERS: Record<string, number>;
export interface LanguageStats {
    bytes: number;
    loc: number;
    weightedLoc: number;
    hours: number;
    percentage: number;
}
export interface AnalysisResult {
    languages: Record<string, LanguageStats>;
    totalLoc: number;
    totalWeightedLoc: number;
    totalHours: number;
    repoCount: number;
}
export declare function calculateAnalysis(languageBytes: Record<string, number>, repoCount: number): AnalysisResult;
export declare function formatTime(hours: number): string;
export declare function generateASCIIBar(percentage: number, maxLength?: number): string;
