// fetch_activities.js

const axios = require('axios');
const fs = require('fs');
const path = require('path');

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN;

async function getAccessToken() {
  try {
    const response = await axios.post('https://www.strava.com/oauth/token', {
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    });
    console.log('🔐 Access token acquired');
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Error getting access token:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function fetchActivities(accessToken) {
  const allActivities = [];
  let page = 1;
  let fetched = [];

  try {
    do {
      const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          per_page: 100,
          page: page,
          after: 0, // Fetch all activities ever
        },
      });

      fetched = response.data;
      console.log(`📦 Page ${page}: ${fetched.length} activities fetched`);

      const filtered = fetched.filter(
        (act) => act.type === 'Run' || act.type === 'Ride'
      );
      console.log(`🏃 Filtered runs/rides: ${filtered.length} this page`);
      console.log(`🧪 Types: ${filtered.map(a => a.type).slice(0, 5)}`);

      allActivities.push(...filtered);
      page++;
    } while (fetched.length === 100);

    console.log(`✅ Total: ${allActivities.length} run/ride activities fetched`);

    const outputPath = path.join(__dirname, 'data', 'activities.json');
    fs.writeFileSync(outputPath, JSON.stringify(allActivities, null, 2));
    console.log('✅ activities.json written!');
  } catch (err) {
    console.error('❌ Error fetching activities:', err.response?.data || err.message);
    process.exit(1);
  }
}

(async () => {
  const token = await getAccessToken();
  await fetchActivities(token);
})();
