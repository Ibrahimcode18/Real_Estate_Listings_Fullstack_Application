const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const isTest = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

if (isTest) {
    console.log(`TEST MODE DETECTED: Connecting to ${process.env.DB_NAME_TEST}`);
    exports.config = {
        host: "localhost",
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_TEST
    }
} else {
    exports.config = {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306, 
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
}