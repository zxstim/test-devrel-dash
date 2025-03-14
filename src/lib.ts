import { Octokit } from 'octokit';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

export const octokit = new Octokit({
  auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
});

interface RepositoryRecord {
  id: number;
  owner: string;
  repository: string;
  contributors: string[];
}

export async function getRateLimitStatus() {
  const result = await octokit.request('GET /rate_limit', {
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });
  console.log('Rate limit status:', result.data);
  return result.data;
}

// Convert TOML to JSON
export async function convertTomlToJson() {
  const tomlContent = fs.readFileSync('src/kaia.toml', 'utf-8');

  // Parse sub_ecosystems
  const subEcosystemsMatch = tomlContent.match(/sub_ecosystems = \[([\s\S]*?)\]/);
  if (!subEcosystemsMatch) throw new Error('Could not find sub_ecosystems section');
  const subEcosystems = subEcosystemsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse github_organizations
  const githubOrgsMatch = tomlContent.match(/github_organizations = \[([\s\S]*?)\]/);
  if (!githubOrgsMatch) throw new Error('Could not find github_organizations section');
  const githubOrgs = githubOrgsMatch[1]
    .split('\n')
    .filter(line => line.includes('"'))
    .map(line => line.trim().replace(/"/g, '').replace(/,/g, ''));

  // Parse repositories
  const repoMatches = tomlContent.match(/\[\[repo\]\]\nurl = "(.+?)"/g);
  if (!repoMatches) throw new Error('Could not find repository entries');
  
  const repos = repoMatches.map((match, index) => {
    const urlMatch = match.match(/url = "(.+?)"/);
    if (!urlMatch) throw new Error(`Could not parse URL from repository entry ${index + 1}`);
    
    const repoMatch = urlMatch[1].match(/github\.com\/([^/]+)\/([^/]+)/);
    if (!repoMatch) throw new Error(`Invalid GitHub URL format in entry ${index + 1}`);
    
    const [, owner, repository] = repoMatch;
    return {
      id: index + 1,
      owner,
      repository
    };
  });

  const jsonContent = {
    sub_ecosystems: subEcosystems,
    github_organizations: githubOrgs,
    repositories: repos
  };

  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
  console.log('Successfully created kaia.json');
}

export async function getContributors(owner: string, repo: string) {
  try {
    const result = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
      owner: owner,
      repo: repo,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    if (result.data) {
      return result.data;
    } else {
      return [];
    }
  } catch (error) {
    console.log(`No contributors found for ${owner}/${repo}`);
    return [];
  }
}

export async function getNumberOfRepositoriesInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  console.log('Total number of repositories: ', jsonContent.repositories.length);
}

export async function getNumberOfAuthorsInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // get all owners of repositories with no duplicates
  const owners = jsonContent.repositories.map((repo: RepositoryRecord) => repo.owner);
  const uniqueOwners = [...new Set(owners)];
  console.log('Total number of unique authors: ', uniqueOwners.length);
}

export async function getNumberOfContributorsInJson() {
  const jsonContent = JSON.parse(fs.readFileSync('src/kaia.json', 'utf-8'));
  // use getContributors for each repository and get the contributors login names, add them to the kaia.json file as a new field called contributors
  for (const repo of jsonContent.repositories) {
    const contributors = await getContributors(repo.owner, repo.repository);
    repo.contributors = contributors.length > 0 
      ? contributors.map((contributor: { login?: string }) => contributor.login || '')
      : [];
    console.log(repo);
  }
  fs.writeFileSync('src/kaia.json', JSON.stringify(jsonContent, null, 2));
}


export async function test() {
  const contributors = await getContributors('kaiachain', 'kaia-kairos-setup-workshop');
  console.log(contributors);
}