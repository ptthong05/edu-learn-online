const http = require('http');

console.log('Fetching http://localhost:5000/api/combos ...');

http.get('http://localhost:5000/api/combos', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Body:');
    console.log(JSON.stringify(JSON.parse(data), null, 2));
  });
});
