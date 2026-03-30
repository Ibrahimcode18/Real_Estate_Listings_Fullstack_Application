const db = require('../helpers/database');

exports.getById = async function getById (id) {
    const query = "SELECT * FROM agents WHERE ID = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.getByUserId = async function getByUserId (id){
    const query = "SELECT * FROM agents WHERE user_id = ?;";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.getAll = async function getAll () {
    const query = "SELECT * FROM agents;";
    const data = await db.run_query(query);
    return data;
}

exports.getPropertiesById = async function getPropertiesById (agentId) {
    const query = `
        SELECT properties.*, locations.city AS location 
        FROM properties 
        JOIN locations ON properties.location_id = locations.id
        WHERE properties.agent_id = ?`;
    const data = await db.run_query(query, [agentId]);
    return data;
}

exports.add = async function add (agent) {
    const query = "INSERT INTO agents (user_id, agency_name, phone_number, license_number, about, is_approved) VALUES (?, ?, ?, ?, ?, ?);";
    const data = await db.run_query(query, [agent.user_id, agent.agency_name, agent.phone_number, agent.license_number, agent.about, agent.is_approved]);
    return data;
}

exports.updateById = async function updateById (id, fieldsToUpdate) {
    const setClause = Object.keys(fieldsToUpdate).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fieldsToUpdate);
    values.push(id);
    const query = `UPDATE agents SET ${setClause} WHERE ID = ?;`;
    const data = await db.run_query(query, values);
    return data;
}

exports.approve = async function approve (id){
    const query = "UPDATE agents SET is_approved = 1 WHERE id = ?";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.suspend = async function suspend (id){
    const query = "UPDATE agents SET is_approved = 0 WHERE id = ?";
    const data = await db.run_query(query, [id]);
    return data;
}

exports.updateRole = async function updateRole (id) {
    const query = "UPDATE users SET role = 'agent' WHERE id = ?";
    const data = await db.run_query(query, [id]);
    return data;
}