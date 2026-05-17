const http = require('http');

const BASE_URL = 'http://localhost:3000';

const request = (path, method, body) => {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data || '{}') }));
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
};

const runTests = async () => {
    console.log("🚀 Starting Auth Flow Verification...\n");
    const timestamp = Date.now();

    // 1. TEST STUDENT FLOW
    console.log("--- 👨‍🎓 Student Flow ---");
    const studentUser = {
        role: "student",
        name: `Student ${timestamp}`,
        id: `ST_${timestamp}`,
        email: `student_${timestamp}@test.com`,
        phone: "1234567890",
        department: "CS",
        password: "password123"
    };

    // Signup via generic /signup
    const sSignup = await request('/signup', 'POST', studentUser);
    console.log(`Signup Status: ${sSignup.status} (Expected 201)`);
    if (sSignup.status !== 201) console.error("   ❌ Signup Failed:", sSignup.body);

    // Login via /student/login
    const sLogin = await request('/student/login', 'POST', { identifier: studentUser.email, password: studentUser.password });
    console.log(`Login Status:  ${sLogin.status} (Expected 200)`);
    if (sLogin.status === 200) console.log("   ✅ Student Login Working!");
    else console.error("   ❌ Student Login Failed:", sLogin.body);


    // 2. TEST STAFF FLOW
    console.log("\n--- 👨‍🏫 Staff Flow ---");
    const staffUser = {
        role: "staff",
        name: `Staff ${timestamp}`,
        id: `SF_${timestamp}`,
        email: `staff_${timestamp}@test.com`,
        phone: "9876543210",
        department: "HR",
        password: "password123"
    };

    // Signup via generic /signup (using role='staff')
    const stSignup = await request('/signup', 'POST', staffUser);
    console.log(`Signup Status: ${stSignup.status} (Expected 201)`);
    if (stSignup.status !== 201) console.error("   ❌ Signup Failed:", stSignup.body);

    // Login via /staff/login
    const stLogin = await request('/staff/login', 'POST', { identifier: staffUser.email, password: staffUser.password });
    console.log(`Login Status:  ${stLogin.status} (Expected 200)`);
    if (stLogin.status === 200) console.log("   ✅ Staff Login Working!");
    else console.error("   ❌ Staff Login Failed:", stLogin.body);


    // 3. TEST ADMIN FLOW
    console.log("\n--- 🛡️ Admin Flow ---");
    // Using the default admin created by setup_admin.js
    const adminUser = { identifier: "ADMIN001", password: "admin123" };

    // Login via /admin/login
    const aLogin = await request('/admin/login', 'POST', adminUser);
    console.log(`Login Status:  ${aLogin.status} (Expected 200)`);
    if (aLogin.status === 200) console.log("   ✅ Admin Login Working!");
    else console.error("   ❌ Admin Login Failed:", aLogin.body);

    console.log("\n✨ Verification Complete.");
};

runTests();
