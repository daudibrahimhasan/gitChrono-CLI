interface AnalyzeOptions {
    token?: string;
    user?: string;
    includeForks: boolean;
    includeArchived: boolean;
    top: string;
    output: "table" | "json" | "markdown";
}
export declare function analyze(options: AnalyzeOptions): Promise<void>;
export {};
