const db = require('../helpers/database'); 

exports.getAll = async function getAll() {
    const query = `
        SELECT properties.*, locations.city AS location 
        FROM properties 
        JOIN locations ON properties.location_id = locations.id`;
    const data = await db.run_query(query);
    return data;
}

exports.getById = async function getById (id) {
    const query = `
        SELECT properties.*, locations.city AS location 
        FROM properties 
        JOIN locations ON properties.location_id = locations.id
        WHERE properties.id = ?`;
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

