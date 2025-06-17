const fs = require('fs');
const axios = require('axios');

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

async function getAccessToken() {
  const res = await axios.post('https://www.strava.com/oauth/token', {
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token'
  });
  return res.data.access_token;
}

async function fetchAllActivities() {
  const ACCESS_TOKEN = await getAccessToken();
  let page = 1;
  const per_page = 100;
  let allActivities = [];

  while (true) {
    const res = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` },
      params: { page, per_page }
    });

    const activities = res.data;
    if (activities.length === 0) break;

    const simplified = activities
      .filter(a => ['Run', 'Ride'].includes(a.type) && a.map.summary_polyline)
      .map(a => ({
        name: a.name,
        type: a.type,
        map: { summary_polyline: a.map.summary_polyline }
      }));

    allActivities.push(...simplified);
    page++;
  }

  fs.writeFileSync('data/activities.json', JSON.stringify(allActivities, null, 2));
  console.log(`✅ Saved ${allActivities.length} activities`);
}

fetchAllActivities().catch(err => {
  console.error('❌ Error:', err.response?.data || err.message);
});
