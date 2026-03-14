const db = require('../helpers/database');
const bcrypt = require('bcrypt');

// Get a single user by ID
exports.getById = async function getById (id) {
    const query = "SELECT * FROM users WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

// Get by username (for login later)
exports.findByUsername = async function getByUsername(username) {
    const query = "SELECT * FROM users WHERE username = ?;";
    const user = await db.run_query(query, [username]);
    return user;
}

// Create a new user
exports.add = async function add (user) {
    const query = "INSERT INTO users SET ?";
    const password = user.password;
    const hash = bcrypt.hashSync(password, 10);
    user.password = hash;
    user.role = 'user'; // Default role

    // 4. Save to DB
    const data = await db.run_query(query, [user]);
    return data;
}

// Get all users (used for administrative listing)
exports.getAll = async function getAll() {
    const query = "SELECT * FROM users;";
    const data = await db.run_query(query);
    return data;
}
