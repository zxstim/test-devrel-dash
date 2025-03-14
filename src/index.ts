import { Octokit } from 'octokit';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function main() {
  const octokit = new Octokit({
    auth: process.env.GITHUB_PERSONAL_ACCESS_TOKEN
  });
  
  const result = await octokit.request('GET /repos/{owner}/{repo}/contributors', {
    owner: 'zxstim',
    repo: 'buildstationorg',
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  });

  console.log(result.data);
}

main().catch(console.error);