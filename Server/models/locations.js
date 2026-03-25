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

exports.deleteById = async function deleteById (id) {
    const query = "DELETE FROM locations WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.updateById = async function updateById (id, fieldsToUpdate) {
    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id);
    const query = `UPDATE locations SET ${setClause} WHERE ID = ?;`;
    const data = await db.run_query(query, values);
    return data;
}