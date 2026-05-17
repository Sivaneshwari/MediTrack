const http = require('http');

const testIP = '10.115.172.216';
console.log(`🔍 Testing connection to ${testIP}:3000...\n`);

const testData = JSON.stringify({
    role: 'student',
    name: 'IP Test User',
    id: 'IPTEST_' + Date.now(),
    email: 'iptest' + Date.now() + '@test.com',
    phone: '5555555555',
    department: 'Test',
    password: 'test123456'
});

const options = {
    hostname: testIP,
    port: 3000,
    path: '/signup',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': testData.length
    },
    timeout: 5000
};

const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('✅ SUCCESS! Server is reachable at', testIP);
        console.log('📡 Status Code:', res.statusCode);
        console.log('📥 Response:', data);
        console.log('\n🎉 Your mobile device should be able to connect!');
        console.log(`📱 Using: http://${testIP}:3000`);
    });
});

req.on('error', (error) => {
    console.error('❌ FAILED to connect to', testIP);
    console.error('Error:', error.message);
    console.log('\n💡 Possible issues:');
    console.log('   - Firewall blocking the connection');
    console.log('   - Server not listening on 0.0.0.0');
    console.log('   - Wrong network adapter');
});

req.on('timeout', () => {
    console.error('❌ Connection TIMEOUT');
    req.destroy();
});

req.write(testData);
req.end();
