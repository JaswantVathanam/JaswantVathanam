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
  <style>
    .title { fill:#00B4FF; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:18px; font-weight:600; }
    .line { fill:#FFFFFF; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:16px; }
    .meta { fill:#CCCCCC; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:14px; }
  </style>

  <rect width="300" height="140" fill="#000"/>
  <text x="20" y="35" class="title">GitHub Insights</text>
  <text x="20" y="75" class="line">${profile.public_repos} repos • ${profile.followers} followers</text>
  <text x="20" y="105" class="meta">${stars} stars • ${forks} forks</text>
</svg>`;

  writeSvg(svg);
})();
