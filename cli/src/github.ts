import axios from "axios";

const GITHUB_API = "https://api.github.com";

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  fork: boolean;
  archived: boolean;
  pushed_at: string;
  language: string | null;
}

export interface LanguageBytes {
  [language: string]: number;
}

export async function getAuthenticatedUser(token: string): Promise<string> {
  const response = await axios.get(`${GITHUB_API}/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.login;
}

export async function getUserRepos(token: string, username?: string): Promise<GithubRepo[]> {
  const repos: GithubRepo[] = [];
  let page = 1;

  while (true) {
    const endpoint = username
      ? `${GITHUB_API}/users/${username}/repos`
      : `${GITHUB_API}/user/repos`;

    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      params: {
        per_page: 100,
        page,
        affiliation: username ? undefined : "owner",
        type: username ? "owner" : undefined,
        sort: "pushed",
      },
    });

    repos.push(...response.data);

    if (response.data.length < 100) break;
    page++;
  }

  return repos;
}

export async function getRepoLanguages(token: string, owner: string, repo: string): Promise<LanguageBytes> {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch {
    return {};
  }
}

export async function getLatestCommit(token: string, owner: string, repo: string): Promise<string | null> {
  try {
    const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/commits`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { per_page: 1 },
    });
    return response.data[0]?.sha || null;
  } catch {
    return null;
  }
}
