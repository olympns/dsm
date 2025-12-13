const { Octokit } = require('@octokit/rest');
const fs = require('fs');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = 'olympns';
const REPO_NAME = 'dsm';

async function createDailyDSM() {
  const now = new Date();
  const dateStr = now.toDateString();
  const title = `[DSM] ${dateStr}`;
  
  const { data: members } = await octokit.rest.orgs.listMembers({
    org: REPO_OWNER,
  });
  
  const mentions = members.map(member => `@${member.login}`).join(' ');
  const template = fs.readFileSync('templates/template.md', 'utf8');
  const body = template.replace('{{mentions}}', mentions);

  const openIssues = await octokit.rest.issues.listForRepo({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    state: 'open',
    labels: 'DSM',
  });

  for (const issue of openIssues.data) {
    if (issue.title.startsWith('[DSM]')) {
      await octokit.rest.issues.update({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: issue.number,
        state: 'closed',
      });
    }
  }

  const newIssue = await octokit.rest.issues.create({
    owner: REPO_OWNER,
    repo: REPO_NAME,
    title: title,
    body: body,
    labels: ['DSM'],
  });

  return newIssue.data;
}

if (require.main === module) {
  createDailyDSM();
}

module.exports = { createDailyDSM };