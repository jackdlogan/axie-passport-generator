const fs = require('fs');
const path = require('path');

// Read the environment variable
const apiKey = process.env.AXIE_API_KEY;

// Create the config content
const configContent = `const config = {
    API_KEY: '${apiKey}'
};

export default config;`;

// Write to config.js
fs.writeFileSync(path.join(__dirname, 'config.js'), configContent); 