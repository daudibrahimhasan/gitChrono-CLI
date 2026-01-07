export interface GithubRepo {
    id: number;
    name: string;
    full_name: string;
    owner: {
        login: string;
    };
    fork: boolean;
    archived: boolean;
    pushed_at: string;
    language: string | null;
}
export interface LanguageBytes {
    [language: string]: number;
}
export declare function getAuthenticatedUser(token: string): Promise<string>;
export declare function getUserRepos(token: string, username?: string): Promise<GithubRepo[]>;
export declare function getRepoLanguages(token: string, owner: string, repo: string): Promise<LanguageBytes>;
