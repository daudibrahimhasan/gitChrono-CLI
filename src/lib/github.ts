import axios from "axios";

export async function getUserRepos(accessToken: string) {
  let repos: any[] = [];
  let page = 1;
  while (true) {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${accessToken}`,
      },
      params: {
        per_page: 100,
        page: page,
        affiliation: "owner",
      },
    });
    repos = [...repos, ...response.data];
    if (response.data.length < 100) break;
    page++;
  }
  return repos;
}

export async function getRepoLanguages(owner: string, repo: string, accessToken: string) {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/languages`, {
    headers: {
      Authorization: `token ${accessToken}`,
    },
  });
  return response.data;
}

export async function getLatestCommit(owner: string, repo: string, accessToken: string) {
  const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits`, {
    headers: {
      Authorization: `token ${accessToken}`,
    },
    params: {
      per_page: 1,
    },
  });
  return response.data[0]?.sha;
}
