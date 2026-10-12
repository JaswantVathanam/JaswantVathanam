// Writes tiles/wakatime-status.json for the "Coding now" tile on jaswantvathanam.github.io/dashboard.
// Uses the WakaTime API key from the WAKATIME_API_KEY secret. Only aggregate, non-identifying
// fields are published: today's total, top languages/editors/categories and the time, language
// and category of the latest heartbeat. File paths, project names and branches are never written.
const fs = require('fs');
const fetch = require('node-fetch');

const KEY = process.env.WAKATIME_API_KEY;
const TIME_ZONE = 'Asia/Kolkata';

const api = async path => {
  const res = await fetch(`https://wakatime.com/api/v1/users/current/${path}`, {
    headers: { Authorization: `Basic ${Buffer.from(KEY).toString('base64')}` },
  });
  if (!res.ok) throw new Error(`WakaTime ${path} returned ${res.status}`);
  return (await res.json()).data;
};

const top = (items, count) => (items || [])
  .filter(i => i.total_seconds > 0)
  .slice(0, count)
  .map(i => ({ name: i.name, seconds: Math.round(i.total_seconds), percent: i.percent }));

async function main() {
  if (!KEY) throw new Error('WAKATIME_API_KEY is not set');

  // "Today" in my time zone, matching WakaTime's own day boundary for the account
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(new Date());
  const [status, heartbeats] = await Promise.all([api('status_bar/today'), api(`heartbeats?date=${today}`)]);

  const last = (heartbeats || []).reduce((latest, h) => (!latest || h.time > latest.time ? h : latest), null);

  const data = {
    updatedAt: new Date().toISOString(),
    timeZone: TIME_ZONE,
    today: {
      seconds: Math.round(status.grand_total.total_seconds),
      text: status.grand_total.text,
      languages: top(status.languages, 3),
      editors: top(status.editors, 2),
      categories: top(status.categories, 2),
    },
    lastHeartbeat: last && {
      at: new Date(last.time * 1000).toISOString(),
      language: last.language || null,
      category: last.category || null,
    },
  };

  fs.writeFileSync('tiles/wakatime-status.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`WakaTime: ${data.today.text} today; last activity ${data.lastHeartbeat ? data.lastHeartbeat.at : 'none'}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
