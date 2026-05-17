const http = require('http');

const data = JSON.stringify({
    role: 'student',
    name: 'Test User API',
    id: 'API001',
    email: 'api@test.com',
    phone: '7777777777',
    department: 'Engineering',
    password: 'test123456'
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';

    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response:', responseData);
    });
});

req.on('error', (error) => {
    console.error('Error:', error.message);
});

req.write(data);
req.end();
