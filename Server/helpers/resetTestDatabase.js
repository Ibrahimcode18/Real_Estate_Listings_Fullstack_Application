const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const seedPath = path.join(__dirname, '..', '..', 'real_estate_test_db.sql');

async function resetTestDatabase() {
    const sql = fs.readFileSync(seedPath, 'utf8');
    const connection = await mysql.createConnection({
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: process.env.DB_PASSWORD,
        multipleStatements: true
    });

    try {
        await connection.query(sql);
    } finally {
        await connection.end();
    }
}

module.exports = { resetTestDatabase };
