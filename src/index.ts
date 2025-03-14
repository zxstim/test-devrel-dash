import { getNumberOfContributorsInJson, test, getRateLimitStatus } from './lib';

async function main() {
  await getNumberOfContributorsInJson();
}



main().catch(console.error);