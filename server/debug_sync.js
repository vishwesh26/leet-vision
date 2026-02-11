const axios = require('axios');

const query = `
  query userData($username: String!, $limit: Int!) {
    matchedUser(username: $username) {
      username
      submissionCalendar
      submitStats: submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
    recentAcSubmissionList(username: $username, limit: $limit) {
      id
      title
      titleSlug
      timestamp
    }
  }
`;

async function testApi(username) {
  try {
    console.log(`Testing username: ${username}`);
    const response = await axios.post('https://leetcode.com/graphql', {
      query: query,
      variables: { username, limit: 20 }
    }, {
      headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://leetcode.com/'
      }
    });
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.data && response.data.data.matchedUser) {
        console.log('SUCCESS: User found');
    } else {
        console.log('FAIL: User NOT found or profile is private');
    }
  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.response) {
        console.error('ERROR DATA:', error.response.data);
    }
  }
}

async function runTests() {
  await testApi('neal_wu'); // Known valid
  await testApi('vinit2006'); // User's input
  await testApi('Vinit2006'); // Common case variant
}

runTests();
