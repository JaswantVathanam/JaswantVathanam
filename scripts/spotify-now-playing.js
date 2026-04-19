const fetch = require('node-fetch');
const { getSpotifyAccessToken, writeSvg, escapeXml } = require('./spotify-common');

async function getTrack(token) {
  // Try now playing
  let res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 200) {
    const json = await res.json();
    if (json && json.item) {
      return {
        title: 'Now Playing',
        name: json.item.name,
        artist: json.item.artists.map(a => a.name).join(', ')
      };
    }
  }

  // Fallback: recently played
  res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const json = await res.json();

  if (!json.items || json.items.length === 0) {
    return {
      title: 'Last Played',
      name: 'No recent tracks',
      artist: '—'
    };
  }

  const t = json.items[0].track;

  return {
    title: 'Last Played',
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
  <text x="20" y="35" class="title">${escapeXml(track.title)}</text>
  <text x="20" y="75" class="name">${escapeXml(track.name)}</text>
  <text x="20" y="105" class="artist">${escapeXml(track.artist)}</text>
</svg>`;
}

(async () => {
  const token = await getSpotifyAccessToken();
  const track = await getTrack(token);
  writeSvg('spotify-now-playing.svg', svg(track));
})();
