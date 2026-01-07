import axios from "axios";
const GITHUB_API = "https://api.github.com";
export async function getAuthenticatedUser(token) {
    const response = await axios.get(`${GITHUB_API}/user`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.login;
}
export async function getUserRepos(token, username) {
    const repos = [];
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
        if (response.data.length < 100)
            break;
        page++;
    }
    return repos;
}
export async function getRepoLanguages(token, owner, repo) {
    try {
        const response = await axios.get(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    }
    catch {
        return {};
    }
}
