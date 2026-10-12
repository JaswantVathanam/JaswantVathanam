// Writes tiles/spotify.json for jaswantvathanam.github.io/dashboard, which renders its own
// Spotify tile in the site's theme. The README's SVG tiles are generated separately.
const fs = require('fs');
const fetch = require('node-fetch');
const { getSpotifyAccessToken } = require('./spotify-common');

const api = (token, path) =>
  fetch(`https://api.spotify.com/v1/${path}`, { headers: { Authorization: `Bearer ${token}` } });

// Medium-sized album art (~300px) — the dashboard shows it small
const albumArt = album => {
  const images = (album && album.images) || [];
  return (images[1] || images[0] || {}).url || null;
};

const toTrack = track => ({
  name: track.name,
  artists: track.artists.map(a => a.name),
  album: track.album ? track.album.name : null,
  albumArt: albumArt(track.album),
  url: track.external_urls ? track.external_urls.spotify : null,
  durationMs: track.duration_ms,
});

async function main() {
  const token = await getSpotifyAccessToken();
  if (!token) throw new Error('No Spotify access token');

  let nowPlaying = null;
  const current = await api(token, 'me/player/currently-playing');
  if (current.status === 200) {
    const json = await current.json();
    if (json && json.item && json.currently_playing_type === 'track') {
      nowPlaying = { ...toTrack(json.item), isPlaying: json.is_playing, progressMs: json.progress_ms };
    }
  }

  const recentRes = await api(token, 'me/player/recently-played?limit=5');
  const recentJson = recentRes.ok ? await recentRes.json() : { items: [] };
  const recent = (recentJson.items || []).map(item => ({ ...toTrack(item.track), playedAt: item.played_at }));

  const data = { updatedAt: new Date().toISOString(), nowPlaying, recent };
  fs.writeFileSync('tiles/spotify.json', JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(nowPlaying ? `Now playing: ${nowPlaying.name}` : `Not playing; ${recent.length} recent tracks`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
