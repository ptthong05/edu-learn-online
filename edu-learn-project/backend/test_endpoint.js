const http = require('http');

console.log('Sending request to http://localhost:5000/api/combos ...');

http.get('http://localhost:5000/api/combos', (res) => {
  console.log('Response Status Code:', res.statusCode);
  console.log('Response Headers:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response body snippet:');
    console.log(data.slice(0, 300));
    try {
      const parsed = JSON.parse(data);
      console.log('Successfully parsed response as JSON. Combos count:', parsed.length);
    } catch (e) {
      console.error('Failed to parse response as JSON. Raw body is:');
      console.log(data);
    }
  });
}).on('error', (err) => {
  console.error('Error connecting to backend server:', err.message);
});
