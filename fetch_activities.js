// fetch_activities.js

const axios = require('axios');
const fs = require('fs');

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
    return response.data.access_token;
  } catch (err) {
    console.error('❌ Error getting access token:', err.response?.data || err.message);
    process.exit(1);
  }
}

async function fetchActivities(accessToken) {
  try {
    const response = await axios.get('https://www.strava.com/api/v3/athlete/activities', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        per_page: 100,
        page: 1,
      },
    });

    const filtered = response.data.filter(
      (act) => act.type === 'Run' || act.type === 'Ride'
    );

    console.log(`✅ Fetched ${filtered.length} bike/run activities`);

    fs.writeFileSync('./data/activities.json', JSON.stringify(filtered, null, 2));
  } catch (err) {
    console.error('❌ Error fetching activities:', err.response?.data || err.message);
    process.exit(1);
  }
}

(async () => {
  const token = await getAccessToken();
  await fetchActivities(token);
})();
