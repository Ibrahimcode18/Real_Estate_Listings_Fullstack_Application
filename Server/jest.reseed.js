const { resetTestDatabase } = require('./helpers/resetTestDatabase');
const { pool } = require('./helpers/database');

beforeAll(async () => {
    await resetTestDatabase();
});

afterAll(async () => {
    await pool.end();
});
