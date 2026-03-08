const mysql = require('mysql2/promise');
const { config } = require('../config');


exports.run_query = async function run_query(query, values) {
    try {
        const connection = await mysql.createConnection(config);
        const [data] = await connection.query(query, values);
        await connection.end();
        return data;
    } catch (error) {
        console.error("Database Error:", error);
        throw error;
    }
}