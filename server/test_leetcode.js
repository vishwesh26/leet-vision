const axios = require('axios');

const query = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      submissionCalendar
    }
  }
`;

async function testApi() {
  try {
    const response = await axios.post('https://leetcode.com/graphql', {
      query: query,
      variables: { username: "neal_wu" } 
    }, {
      headers: { 
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://leetcode.com/'
      }
    });
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error(error.message);
  }
}

testApi();
