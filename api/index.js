const serverless = require('serverless-http');
const app = require('../server'); // <- utilise app seul ici

module.exports = serverless(app); // ✅ c'est ce que Vercel appelle
