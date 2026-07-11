import { Octokit } from "octokit";

const octokit = new Octokit({
  auth: process.env.GITHUB_MCP,
});

const owner = process.env.GITHUB_OWNER || "innovaradynamics";

export async function createGitHubRepo(repoName: string) {
  try {
    // Try creating an organization repo first
    const response = await octokit.request('POST /orgs/{org}/repos', {
      org: owner,
      name: repoName,
      private: true,
      auto_init: true,
      description: `Document repository for ${repoName}`,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.data;
  } catch (error: any) {
    // If it fails (e.g. because GITHUB_OWNER is a user, not an org), fallback to user repo
    if (error.status === 404 || error.message.includes('Not Found')) {
      const response = await octokit.request('POST /user/repos', {
        name: repoName,
        private: true,
        auto_init: true,
        description: `Document repository for ${repoName}`,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      return response.data;
    }
    throw error;
  }
}

export async function uploadFileToGitHub(repoName: string, filePath: string, contentBase64: string, message: string, sha?: string) {
  const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo: repoName,
    path: filePath,
    message: message,
    content: contentBase64,
    sha: sha, // Required if updating an existing file
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  return response.data;
}

export async function getFileFromGitHub(repoName: string, filePath: string) {
  try {
    const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
      owner,
      repo: repoName,
      path: filePath,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function deleteFileFromGitHub(repoName: string, filePath: string, sha: string, message: string) {
  const response = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
    owner,
    repo: repoName,
    path: filePath,
    message: message,
    sha: sha,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  return response.data;
}
