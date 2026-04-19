const fetch = require('node-fetch');
const { getSpotifyAccessToken, writeSvg, escapeXml } = require('./spotify-common');

async function getLastPlayed(token) {
  const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();

  if (!json.items || json.items.length === 0) {
    return {
      name: 'No recent tracks',
      artist: '—'
    };
  }

  const t = json.items[0].track;

  return {
    name: t.name,
    artist: t.artists.map(a => a.name).join(', ')
  };
}

function svg(track) {
  return `
<svg width="300" height="140" xmlns="http://www.w3.org/2000/svg">
  <style>
    .title { fill:#00B4FF; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:18px; font-weight:600; }
    .name { fill:#FFFFFF; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:20px; font-weight:600; }
    .artist { fill:#CCCCCC; font-family:"Segoe UI Variable","Segoe UI",sans-serif; font-size:14px; }
  </style>

  <rect width="300" height="140" fill="#000"/>
  <text x="20" y="35" class="title">Recently Played</text>
  <text x="20" y="75" class="name">${escapeXml(track.name)}</text>
  <text x="20" y="105" class="artist">${escapeXml(track.artist)}</text>
</svg>`;
}

(async () => {
  const token = await getSpotifyAccessToken();
  const track = await getLastPlayed(token);
  writeSvg('spotify-recently-played.svg', svg(track));
})();
