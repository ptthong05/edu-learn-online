const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'index.js');
const content = fs.readFileSync(filePath, 'utf8');

const regex = /app\.(get|post|put|delete)\(['"]([^'"]+)['"]/g;
let match;
const routes = [];

while ((match = regex.exec(content)) !== null) {
  routes.push(`${match[1].toUpperCase()} ${match[2]}`);
}

console.log('All registered routes in index.js:');
console.log(routes.join('\n'));
