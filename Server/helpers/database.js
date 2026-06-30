const mysql = require('mysql2/promise');
const { config } = require('../config');


exports.run_query = async function run_query(query, values) {
    try {
        const isProduction = process.env.NODE_ENV === 'production';

        const connection = await mysql.createConnection({
            ...config,
            ssl: isProduction ? { rejectUnauthorized: false } : undefined
        });
        const [data] = await connection.query(query, values);
        await connection.end();
        return data;
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
}