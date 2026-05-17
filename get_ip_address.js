const os = require('os');
const interfaces = os.networkInterfaces();
const results = [];

for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            results.push({ name, address: iface.address });
        }
    }
}

console.log(JSON.stringify(results, null, 2));
