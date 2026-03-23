const db = require('../helpers/database'); 

exports.getPropertiesById = async function getPropertiesById(id) {
    const query = "SELECT * FROM properties WHERE location_id = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

// GET the Location with the parameter id
exports.getById = async function getById(id){
    const query = "SELECT * FROM locations WHERE id = ?;";
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