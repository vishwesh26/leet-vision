
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.error("❌ GEMINI_API_KEY is missing in server/.env");
    process.exit(1);
}

console.log(`Checking available models for Key: ${API_KEY.substring(0, 10)}...`);

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        const response = await axios.get(url);
        
        console.log("\n✅ AVAILABLE MODELS:");
        const models = response.data.models || [];
        
        if (models.length === 0) {
            console.log("No models found. Your key might have no access.");
        }

        models.forEach(model => {
            if (model.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${model.name.replace('models/', '')} \t(${model.displayName})`);
            }
        });

    } catch (error) {
        console.error("\n❌ FAILED TO LIST MODELS:");
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error(`Data:`, JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

listModels();
