const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/locations');
const prefix = '/api/v1/locations'
const router = new Router({ prefix: prefix });
const { validateLocation, validateLocationUpdate } = require('../controllers/validation');

const auth = require('../controllers/auth');
const passport = require('koa-passport');
const can = require('../permissions/locations');

const optionalAuth = (ctx, next) => {
    return passport.authenticate('jwt', { session: false }, (err, user) => {
        if (user) ctx.state.user = user; // Attach user if token is valid
        return next(); // Always proceed, even if guest
    })(ctx, next);
};

// Routes
router.get('/', optionalAuth, getAll);
router.post('/', auth.requireJWT, bodyParser(), validateLocation, createLocation);
router.get('/:id/properties', auth.requireJWT, getPropertiesById);
router.put('/:id', auth.requireJWT, bodyParser(), validateLocationUpdate, updateLocation);
router.delete('/:id', auth.requireJWT, deleteLocation);



// Handlers
async function getAll(ctx) {
    const user = ctx.state.user;
    try{
        const data = await model.getAll();
        if (data.length) {
            ctx.body = data.map(location => {
                const { id, city, image_url } = location;
                const links = {
                    self: `http://${ctx.host}${prefix}/${id}/properties`
                }
                if (user) {
                    // Ask your permission system if this specific user can edit or delete this location
                    const updatePermission = can.update(user, location);
                    const deletePermission = can.delete(user, location);

                    // If the permission system says yes, reveal the links!
                    if (updatePermission.granted) {
                        links.update = `http://${ctx.host}${prefix}/${id}`;
                    }
                    if (deletePermission.granted) {
                        links.delete = `http://${ctx.host}${prefix}/${id}`;
                    }
                }

            return { id, city, image_url, links };
            });
        } else {
            ctx.body = data; 
        }
    } catch (err){
        console.error("Error fetching locations:", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while fetching locations." };
    }
}

async function createLocation(ctx) {
    try {
        const permission = can.create(ctx.state.user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Only admins can create locations." };
            return;
        }
        const result = await model.add(ctx.request.body);
        if (result.affectedRows) {
            ctx.status = 201;
            ctx.body = { ID: result.insertId, created: true, link: `${ctx.request.path}/${result.insertId}/properties` };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the location." };
    }
}

async function getPropertiesById(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Property ID." };
        return;
    }
    try{
        const data = await model.getPropertiesById(id);
        if (data.length) {
            ctx.body = data.map(post => {
                const { id, title, description, listing_type, price, location, image_url } = post;
                
                const links = {
                    self: `http://${ctx.host}/api/v1/properties/${id}`
                }
                return { id, title, description, listing_type, price, location, image_url };
            });

        } else {
            ctx.status = 404;
            ctx.body = { message: "No properties found for this location." };
        }
    } catch(err){
        console.error("Error fetching properties by location:", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while fetching properties by location" };
    }
    
}

async function updateLocation(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Location ID." };
        return;
    }
    
    try{
        const existingData = await model.getById(id); // Fetch the existing location
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "Location not found." };
            return;
        }

        const location = existingData[0];

        // CHECK PERMISSION
        // ctx.state.user contains the logged-in user (thanks to Passport)
        const permission = can.update(ctx.state.user, location);
        if (!permission.granted) {
            ctx.status = 403; // Forbidden
            ctx.body = { error: "You do not have permission to edit this location" };
            return;
        }

        const updateData = ctx.request.body;
        const result = await model.updateById(id, updateData);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { ID: id, updated: true, link: prefix };
        } else {
            ctx.status = 400;
            ctx.body = { message: "Update Failed" };
        }
    } catch (err){
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating location." };
    }
    
}

async function deleteLocation(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Location ID." };
        return;
    }
    
    try {
        const existingData = await model.getById(id); // Fetch the existing property
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "Location not found." };
            return;
        }

        const location = existingData[0];

        // CHECK PERMISSION
        const permission = can.delete(ctx.state.user, location);
        if (!permission.granted) {
            ctx.status = 403; // Forbidden
            ctx.body = { error: "You do not have permission to delete this location" };
            return;
        } 

        const result = await model.deleteById(id);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { message: "Location deleted successfully." };
        } else {
            ctx.status = 404;
            ctx.body = { message: "Delete failed" };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while deleting the property." };
    }
}

module.exports = router;