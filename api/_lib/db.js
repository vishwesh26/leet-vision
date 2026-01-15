const problemsDb = require('../data/problems.json') || [];

let companiesDb = {};
try {
    companiesDb = require('../data/companies.json');
} catch (e) {
    console.warn("Companies DB not found or empty");
}

module.exports = {
    problemsDb,
    companiesDb
};
