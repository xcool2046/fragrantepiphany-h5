const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('Current directory:', process.cwd());

const envPath = path.join(process.cwd(), '.env');
console.log('Checking .env at:', envPath);

if (fs.existsSync(envPath)) {
    console.log('.env file exists');
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    const key = envConfig.STRIPE_SECRET_KEY;
    if (key) {
        console.log('STRIPE_SECRET_KEY in file:', key.substring(0, 8) + '...' + key.substring(key.length - 4));
    } else {
        console.log('STRIPE_SECRET_KEY not found in file');
    }

     const testKey = envConfig.STRIPE_SECRET_KEY_TEST;
    if (testKey) {
         console.log('STRIPE_SECRET_KEY_TEST in file:', testKey.substring(0, 8) + '...');
    }

} else {
    console.log('.env file does NOT exist');
}
