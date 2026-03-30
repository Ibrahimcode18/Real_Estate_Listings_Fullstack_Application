const AccessControl = require('role-acl');
const ac = new AccessControl();

// --- THE ADMIN ---
// Admins have absolute power over the 'agent' resource
ac.grant('admin').execute('readAll').on('agent'); 
ac.grant('admin').execute('read').on('agent');
ac.grant('admin').execute('update').on('agent');
ac.grant('admin').execute('readAllProperties').on('property');
ac.grant('admin').execute('approve').on('agent');
ac.grant('admin').execute('suspend').on('agent');

// --- AGENTS ---
// Agents can only view and edit their OWN profiles
ac.grant('agent')
    .execute('read')
    .on('agent');

ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('readAllProperties')
    .on('property');

ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('update')
    .on('agent');

ac.grant('user')
    .execute('read')
    .on('agent');

exports.readAll = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    return ac.can(requester.role).execute('readAll').sync().on('agent');
}

exports.approve = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    return ac.can(requester.role).execute('approve').sync().on('agent');
}

exports.suspend = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    return ac.can(requester.role).execute('suspend').sync().on('agent');
}

exports.read = (requester, targetAgent) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    
    return ac
        .can(requester.role)
        // targetAgent.id is the ID of the agent profile they are trying to view
        .context({ requester: requester.agent_id, owner: targetAgent.id }) 
        .execute('read')
        .sync()
        .on('agent');
}

exports.readAllProperties = (requester, targetAgentId) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    
    return ac
        .can(requester.role)
        // targetAgent.id is the ID of the agent profile they are trying to view
        .context({ requester: requester.agent_id, owner: targetAgentId }) 
        .execute('readAllProperties')
        .sync()
        .on('property');
}


exports.update = (requester, targetAgent) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    
    return ac
        .can(requester.role)
        .context({ requester: requester.agent_id, owner: targetAgent.id }) 
        .execute('update')
        .sync()
        .on('agent');
}