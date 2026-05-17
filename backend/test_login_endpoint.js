const fetch = require('node-fetch'); // NOTE: In standard Node environment you might need to import or require differently if 'type': 'module' is not set. 
// checking package.json, main is server.js and no "type": "module".
// node-fetch might not be installed. safer to use http module or just assuming fetch is available in newer node (v18+)

const testLogin = async () => {
    try {
        const response = await fetch('http://localhost:3000/student/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                identifier: 'student',
                password: '123456'
            })
        });

        const data = await response.json();
        console.log("Status:", response.status);
        console.log("Response:", data);
    } catch (err) {
        console.error("Error:", err);
    }
};

testLogin();
