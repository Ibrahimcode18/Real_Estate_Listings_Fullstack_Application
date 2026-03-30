const AccessControl = require('role-acl');
const ac = new AccessControl();


// Admins have full control over the 'user' resource
ac.grant('admin').execute('readAll').on('user'); 
ac.grant('admin').execute('read').on('user');
ac.grant('admin').execute('update').on('user');


// Users can only view and edit their own profiles
ac.grant('user')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('read')
    .on('user');

ac.grant('user')
    .condition({ Fn: 'EQUALS', args: { 'requester': '$.owner' } })
    .execute('update')
    .on('user');

// Agents can read and update their own user profiles
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