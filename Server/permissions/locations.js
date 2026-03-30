const AccessControl = require('role-acl');
const ac = new AccessControl();


// Admins can do anything to any location (No conditions)
ac.grant('admin').execute('update').on('location');
ac.grant('admin').execute('delete').on('location');
ac.grant('admin').execute('create').on('location');

// Agents can read locations, no conditions
ac.grant('agent').execute('read').on('location')

// Users can read locations, no conditions
ac.grant('user').execute('read').on('location');


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