const AccessControl = require('role-acl');
const ac = new AccessControl();

// --- THE ADMIN ---
// Admins have absolute power over the 'user' resource
ac.grant('admin').execute('readAll').on('user'); 
ac.grant('admin').execute('read').on('user');
ac.grant('admin').execute('update').on('user');

// --- THE USER ---
// Users can only view and edit their OWN profiles
ac.grant('user')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('read')
    .on('user');

ac.grant('user')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('update')
    .on('user');

// --- THE AGENT ---
ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('read')
    .on('user');

ac.grant('agent')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('update')
    .on('user');


exports.readAll = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    return ac.can(requester.role).execute('readAll').sync().on('user');
}


exports.read = (requester, targetUser) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    
    return ac
        .can(requester.role)
        // targetUser.ID is the ID of the profile they are trying to view
        .context({ requester: requester.id, owner: targetUser.id }) 
        .execute('read')
        .sync()
        .on('user');
}


exports.update = (requester, targetUser) => {
    if (!ac.hasRole(requester.role)) return { granted: false };
    
    return ac
        .can(requester.role)
        .context({ requester: requester.id, owner: targetUser.id }) 
        .execute('update')
        .sync()
        .on('user');
}