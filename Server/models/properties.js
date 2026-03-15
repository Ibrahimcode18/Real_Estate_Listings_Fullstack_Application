const db = require('../helpers/database'); 

exports.getAll = async function getAll() {
    const query = "SELECT * FROM properties;";
    const data = await db.run_query(query);
    return data;
}

exports.getById = async function getById (id) {
    const query = "SELECT * FROM properties WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.add = async function add (property) {
    const query = "INSERT INTO properties SET ?;";
    const data = await db.run_query(query, [property]);
    return data;
}

exports.deleteById = async function deleteById (id) {
    const query = "DELETE FROM properties WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.updateById = async function updateById (id, fieldsToUpdate) {
    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id);
    const query = `UPDATE properties SET ${setClause} WHERE ID = ?;`;
    const data = await db.run_query(query, values);
    return data;
}

