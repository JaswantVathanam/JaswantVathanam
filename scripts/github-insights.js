const fs = require('fs');
const fetch = require('node-fetch');

async function get(url) {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
  });
  return res.json();
}

function writeSvg(svg) {
  fs.writeFileSync('tiles/github-insights.svg', svg, 'utf8');
}

(async () => {
  const user = 'JaswantVathanam';
  const profile = await get(`https://api.github.com/users/${user}`);
  const repos = await get(`https://api.github.com/users/${user}/repos?per_page=100`);

  const stars = repos.reduce((a, r) => a + r.stargazers_count, 0);
  const forks = repos.reduce((a, r) => a + r.forks_count, 0);

  const svg = `
<svg width="300" height="140" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="140" fill="#000"/>
  <text x="20" y="35" fill="#00B4FF" font-size="18">GitHub Insights</text>
  <text x="20" y="75" fill="#fff" font-size="16">${profile.public_repos} repos • ${profile.followers} followers</text>
  <text x="20" y="105" fill="#ccc" font-size="14">${stars} stars • ${forks} forks</text>
</svg>`;

  writeSvg(svg);
})();
