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
        },
      });

      fetched = response.data;

      // Filter just runs and rides
      const filtered = fetched.filter(
        (act) => act.type === 'Run' || act.type === 'Ride'
      );

      allActivities.push(...filtered);
      console.log(`📦 Page ${page}: ${filtered.length} activities added`);

      page++;
    } while (fetched.length === 100);

    console.log(`✅ Total: ${allActivities.length} bike/run activities fetched`);

    fs.writeFileSync('./data/activities.json', JSON.stringify(allActivities, null, 2));
  } catch (err) {
    console.error('❌ Error fetching activities:', err.response?.data || err.message);
    process.exit(1);
  }
}
