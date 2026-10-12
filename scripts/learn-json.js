// Writes tiles/learn.json for jaswantvathanam.github.io (Certification Tracker + dashboard).
// Source: my public Microsoft Learn transcript share link. Learn's API doesn't allow browser
// (CORS) requests, so it is fetched here and republished. Personal fields such as the contact
// email are deliberately dropped — only what the site displays is written.
const fs = require('fs');
const fetch = require('node-fetch');

const SHARE_ID = '7o9n9hzy8xn34m9';
const API = `https://learn.microsoft.com/api/profiles/transcript/share/${SHARE_ID}?locale=en-us`;

// Learn descriptions contain HTML entities such as &nbsp;
const plain = text => (text || '')
  .replace(/<[^>]+>/g, '')
  .replace(/&nbsp;/g, ' ')
  .replace(/&amp;/g, '&')
  .replace(/\s+/g, ' ')
  .trim();

async function main() {
  const res = await fetch(API, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`Learn API returned ${res.status}`);
  const t = await res.json();

  const appliedSkills = ((t.appliedSkillsData || {}).appliedSkillsCredentials || []).map(c => ({
    title: c.title.replace(/^Microsoft Applied Skills:\s*/, ''),
    credentialId: c.credentialId,
    awardedOn: c.awardedOn,
  }));

  const data = {
    updatedAt: new Date().toISOString(),
    totals: {
      modules: t.totalModulesCompleted,
      learningPaths: t.totalLearningPathsCompleted,
      trainingMinutes: t.totalTrainingMinutes,
      appliedSkills: appliedSkills.length,
    },
    appliedSkills,
    learningPaths: (t.learningPathsCompleted || []).map(p => ({
      title: p.title,
      description: plain(p.description),
      completedOn: p.completedOn,
      minutes: Number(p.durationInMinutes) || 0,
      assessmentsPassed: Boolean(p.passedOn),
    })),
    modules: (t.modulesCompleted || []).map(m => ({
      title: m.title,
      completedOn: m.completedOn,
      minutes: Number(m.durationInMinutes) || 0,
      assessmentPassed: Boolean(m.moduleAssessment && m.moduleAssessment.moduleAssessmentPassed),
      url: m.url ? `https://learn.microsoft.com${m.url}` : null,
    })),
  };

  // Guard against a partial API response wiping the published data
  if (!data.modules.length) throw new Error('Transcript returned no modules; keeping previous learn.json');

  fs.writeFileSync('tiles/learn.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`Learn: ${data.totals.modules} modules, ${data.totals.learningPaths} paths, ${data.totals.appliedSkills} Applied Skills`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
