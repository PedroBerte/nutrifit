const fs = require('fs');
const path = 'C:/Users/mauri/source/repos/nutrifit/backend-node/src/app.ts';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');
const newContent = lines.slice(0, 30).join('\n') + '\n';
fs.writeFileSync(path, newContent);
console.log('done, lines:', newContent.split('\n').length);
