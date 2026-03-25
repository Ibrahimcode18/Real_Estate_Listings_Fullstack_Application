const AccessControl = require('role-acl');
const ac = new AccessControl();

// --- 1. THE ADMIN ---
// Admins can do anything to any location (No conditions)
ac.grant('admin').execute('update').on('location');
ac.grant('admin').execute('delete').on('location');
ac.grant('admin').execute('create').on('location');

// --- 2. THE AGENT ---
ac.grant('agent').execute('read').on('location')

// --- 3. THE USER ---
ac.grant('user').execute('read').on('location');


// --- CHECKER FUNCTIONS ---
exports.create = (requester) => {
    if (!ac.hasRole(requester.role)) {
        return { granted: false };
    }

    return ac
        .can(requester.role)
        .execute('create')
        .sync()
        .on('location');
}

exports.update = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };

    return ac
        .can(requester.role)
        .execute('update')
        .sync()
        .on('location');
}

exports.delete = (requester) => {
    if (!ac.hasRole(requester.role)) return { granted: false };

    return ac
        .can(requester.role) 
        .execute('delete')
        .sync()
        .on('location');
}