const fs = require('fs');
const fetch = require('node-fetch');

async function getSpotifyAccessToken() {
  const body = new URLSearchParams();
  body.append('grant_type', 'refresh_token');
  body.append('refresh_token', process.env.SPOTIFY_REFRESH_TOKEN);
  body.append('client_id', process.env.SPOTIFY_CLIENT_ID);
  body.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET);

  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  const json = await res.json();
  return json.access_token;
}

function writeSvg(filename, svg) {
  fs.writeFileSync(`tiles/${filename}`, svg, 'utf8');
}

function escapeXml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');
}

module.exports = { getSpotifyAccessToken, writeSvg, escapeXml };
