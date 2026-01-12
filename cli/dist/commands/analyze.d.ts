interface AnalyzeOptions {
    token?: string;
    user?: string;
    includeForks: boolean;
    includeArchived: boolean;
    top: string;
    output: "table" | "json" | "markdown";
    readme: boolean;
    outputFile?: string;
}
export declare function analyze(options: AnalyzeOptions): Promise<void>;
export {};
