const http = require('http');

console.log('🔍 Testing server health...\n');

// Test 1: Check if server is responding
const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    }
};

const testData = JSON.stringify({
    role: 'student',
    name: 'Health Check Test',
    id: 'HEALTH_' + Date.now(),
    email: 'health' + Date.now() + '@test.com',
    phone: '1111111111',
    department: 'Test',
    password: 'test123456'
});

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('✅ Server is responding!');
        console.log('📡 Status Code:', res.statusCode);
        console.log('📥 Response:', data);

        if (res.statusCode === 201) {
            console.log('\n🎉 SUCCESS! Server is working correctly!');
            console.log('✅ Database connection is active');
            console.log('✅ Signup endpoint is functional');
        } else {
            console.log('\n⚠️  Server responded but with an error');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Server is NOT responding!');
    console.error('Error:', error.message);
    console.log('\n💡 Try starting the server with: npm run dev');
});

req.write(testData);
req.end();
