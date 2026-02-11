const fs = require('fs');
const path = require('path');

const rawPath = path.join(__dirname, 'full_raw_codechef.txt');
const masterPath = path.join(__dirname, 'codechef_master_list.js');

const generate = () => {
    try {
        const rawContent = fs.readFileSync(rawPath, 'utf8');
        const lines = rawContent.split('\n');
        
        const questions = [];
        let currentQuestion = {};
        let currentModule = '';

        lines.forEach(line => {
            const trimmed = line.trim();
            
            // Detect Module Header
            if (trimmed.startsWith('Module')) {
                // Example: "Module 3: Arrays" -> "Arrays"
                // Example: "Module 1: Basic programming - 1" -> "Basic programming - 1"
                const parts = trimmed.split(':');
                if (parts.length > 1) {
                    currentModule = parts[1].trim();
                } else {
                    currentModule = trimmed; // Fallback
                }
            } else if (trimmed.startsWith('Question Name:')) {
                currentQuestion.title = trimmed.replace('Question Name:', '').trim();
            } else if (trimmed.startsWith('Question Link:')) {
                currentQuestion.url = trimmed.replace('Question Link:', '').trim();
                
                // Extract slug
                const parts = currentQuestion.url.split('/problems/');
                if (parts.length > 1) {
                    currentQuestion.slug = parts[1].replace(/\/$/, '');
                } else {
                    currentQuestion.slug = currentQuestion.title.toLowerCase().replace(/ /g, '-');
                }

                if (currentQuestion.title && currentQuestion.url) {
                    // Add current module as a tag
                    if (currentModule) {
                        currentQuestion.tags = [currentModule];
                    }

                    questions.push({ ...currentQuestion });
                    currentQuestion = {}; // Reset
                }
            }
        });

        const fileContent = `module.exports = ${JSON.stringify(questions, null, 4)};\n`;
        fs.writeFileSync(masterPath, fileContent);

        console.log(`Generated master list with ${questions.length} questions.`);
        if (questions.length > 0) {
            console.log('Sample question tags:', questions[0].tags);
        }

    } catch (err) {
        console.error('Generation failed:', err);
    }
};

generate();
