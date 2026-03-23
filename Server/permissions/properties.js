const AccessControl = require('role-acl');
const ac = new AccessControl();

// --- 1. THE ADMIN ---
// Admins can do anything to any property (No conditions)
ac.grant('admin').execute('update').on('property');
ac.grant('admin').execute('delete').on('property');

// --- 2. THE AGENT ---
// Agents can update and delete, but ONLY if they own it
ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('update')
    .on('property');

ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('delete')
    .on('property');

// --- 3. THE USER ---
ac.grant('user').execute('read').on('property');


// --- CHECKER FUNCTIONS ---
exports.update = (requester, data) => {
    if (!ac.hasRole(requester.role)) return { granted: false };

    return ac
        .can(requester.role)
        .context({ requester: requester.agent_id, owner: data.agent_id }) 
        .execute('update')
        .sync()
        .on('property');
}

exports.delete = (requester, data) => {
    if (!ac.hasRole(requester.role)) return { granted: false };

    return ac
        .can(requester.role)
        .context({ requester: requester.agent_id, owner: data.agent_id }) 
        .execute('delete')
        .sync()
        .on('property');
}