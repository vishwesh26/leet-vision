const axios = require('axios');
const fs = require('fs');
const path = require('path');

const PROBLEMS_FILE = path.join(__dirname, '..', 'data', 'problems.json');

const query = `
  query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
    problemsetQuestionList: questionList(
      categorySlug: $categorySlug
      limit: $limit
      skip: $skip
      filters: $filters
    ) {
      total: totalNum
      questions: data {
        frontendQuestionId: questionId
        topicTags {
          name
        }
      }
    }
  }
`;

async function fetchAllTopics() {
    let allQuestions = {};
    let skip = 0;
    const limit = 100;
    let hasMore = true;

    console.log('Fetching topic tags from LeetCode...');

    while (hasMore) {
        try {
            const response = await axios.post('https://leetcode.com/graphql', {
                query: query,
                variables: {
                    categorySlug: "",
                    skip: skip,
                    limit: limit,
                    filters: {}
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0'
                }
            });

            const data = response.data.data.problemsetQuestionList;
            const questions = data.questions;

            if (questions.length === 0) {
                hasMore = false;
                break;
            }

            questions.forEach(q => {
                allQuestions[q.frontendQuestionId] = q.topicTags.map(t => t.name);
            });

            skip += limit;
            console.log(`Fetched ${Object.keys(allQuestions).length} / ${data.total} problem tags...`);

            if (Object.keys(allQuestions).length >= data.total) {
                hasMore = false;
            }

            // Small delay to be polite
            await new Promise(resolve => setTimeout(resolve, 300));

        } catch (error) {
            console.error('Error fetching questions:', error.message);
            hasMore = false;
        }
    }

    return allQuestions;
}

async function sync() {
    try {
        if (!fs.existsSync(PROBLEMS_FILE)) {
            console.error('problems.json not found!');
            return;
        }

        const problems = JSON.parse(fs.readFileSync(PROBLEMS_FILE, 'utf8'));
        const leetcodeTopics = await fetchAllTopics();

        let updatedCount = 0;
        const updatedProblems = problems.map(p => {
            const tags = leetcodeTopics[p.id];
            if (tags && tags.length > 0) {
                updatedCount++;
                return { ...p, topics: tags };
            }
            return p;
        });

        fs.writeFileSync(PROBLEMS_FILE, JSON.stringify(updatedProblems, null, 2));
        console.log(`Successfully updated ${updatedCount} questions with topic tags.`);

    } catch (error) {
        console.error('Sync failed:', error);
    }
}

sync();
