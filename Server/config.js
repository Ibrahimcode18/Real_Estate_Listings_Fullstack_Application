require('dotenv').config();
if (process.env.NODE_ENV === 'test') {
    console.log(`TEST MODE DETECTED: Connecting to real_estate_test_db`);
    exports.config = {
        host: "localhost",
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME_TEST
    }
} else {
    exports.config = {
        host: "localhost",
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
}