const mysql = require('mysql2/promise');
const { config } = require('../config');

const isProduction = process.env.NODE_ENV === 'production';
const poolConfig = {
    ...config,
    ssl: isProduction ? { rejectUnauthorized: false } : undefined,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(poolConfig);

exports.run_query = async function run_query(query, values) {
    try {
        const [data] = await pool.query(query, values);
        return data;
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
}