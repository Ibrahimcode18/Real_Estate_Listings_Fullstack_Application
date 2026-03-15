const db = require('../helpers/database'); 

exports.findLocationById = async function findLocationById (id) {
    const query = "SELECT * FROM locations WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.getAll = async function getAll() {
    const query = "SELECT * FROM locations;";
    const data = await db.run_query(query);
    return data;
}

exports.add = async function add (location) {
    const query = "INSERT INTO locations SET ?";
    const data = await db.run_query(query, [location]);
    return data;
}