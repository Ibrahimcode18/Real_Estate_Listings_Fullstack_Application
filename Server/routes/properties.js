const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const auth = require('../controllers/auth');
const passport = require('koa-passport');
const can = require('../permissions/properties');

const model = require('../models/properties');
const locationModel = require('../models/locations');

const prefix = '/api/v1/properties'
const router = new Router({ prefix: prefix }); // Prefix means all routes here start with /api/v1/properties

const { validateProperty, validatePropertyUpdate } = require('../controllers/validation');

const optionalAuth = (ctx, next) => {
    return passport.authenticate('jwt', { session: false }, (err, user) => {
        if (user) ctx.state.user = user; // Attach user if token is valid
        return next(); // Always proceed, even if guest
    })(ctx, next);
};


// Routes
router.get('/', getAll);
router.get('/:id', optionalAuth, getById);
router.post('/', auth.requireJWT, bodyParser(), validateProperty, createProperty);
router.put('/:id', auth.requireJWT, bodyParser(), validatePropertyUpdate, updateProperty);
router.delete('/:id', auth.requireJWT, deleteProperty);

// Handlers
async function getAll(ctx) {
    try{
        const data = await model.getAll();
        if (data.length) {
            ctx.body = data.map(post => {
                const { id, title, description, image_url } = post;
                
                const links = {
                    self: `http://${ctx.host}${prefix}/${id}`
                }

                return { id, title, description, image_url, links };
            });
        } else {
            ctx.status = 404;
            ctx.body = { message: "No properties found" };
        }
    } catch(err){
        console.error("Error fetching properties:", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while fetching properties." };
    }
}

async function createProperty(ctx) {
    try{
        const body = ctx.request.body;

        const agentId = ctx.state.user.agent_id;
        // Block users who don't have an agent profile
        if (!agentId) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You must have an agent profile to create a property." };
            return;
        }
        const isLocationIdValid = await locationModel.getById(body.location_id);
        if (!isLocationIdValid.length) { // If the locationId doesn't exist in the locations table, it is considered a bad request.
            ctx.status = 400;
            ctx.body = { message: "Invalid locationId. No such location exists." };
            return;
        }

        body.agent_id = agentId;
        const result = await model.add(body);
        
        if (result.affectedRows) {
            ctx.status = 201;
            ctx.body = { ID: result.insertId, created: true, 
                link: `http://${ctx.host}${ctx.request.path}/${result.insertId}` 
            };
        } else {
            ctx.status = 400;
            ctx.body = { message: "Failed to create property." };
        }
    } catch (err) {
        console.log("Error occured while creating property:", err)
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the property." };
    }
}

async function getById(ctx){
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Property ID." };
        return;
    }
    try{
        const data = await model.getById(id);
        if(data.length) {
            const property = data[0];
            const user = ctx.state.user; // Might be undefined if guest
            // 1. Base HATEOAS Links (Everyone gets these)
            property.links = {
                self: `http://${ctx.host}${prefix}/${property.id}`,
            };
            // 2. Dynamic RBAC Links
            if (user) {
                // Check permissions using the ACL rules defined in Part 1
                const updatePermission = can.update(user, property);
                const deletePermission = can.delete(user, property);
                // If the ACL says yes, add the links!
                if (updatePermission.granted) {
                    property.links.update = `http://${ctx.host}${prefix}/${property.id}`;
                }
                if (deletePermission.granted) {
                    property.links.delete = `http://${ctx.host}${prefix}/${property.id}`;
                }
            }
            ctx.body = property;
        } else {
            ctx.status = 404;
            ctx.body = { message: "Property not found" };
        }
    } catch (err){
        console.error("Error fetching property by id:", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while fetching property by id." };
    }
}

async function updateProperty(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Property ID." };
        return;
    }
    try {
        const existingData = await model.getById(id); // Fetch the existing property
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "Property not found." };
            return;
        }
        const property = existingData[0];

        // CHECK PERMISSION
        // ctx.state.user contains the logged-in user (thanks to Passport)
        const permission = can.update(ctx.state.user, property);
        if (!permission.granted) {
            ctx.status = 403; // Forbidden
            ctx.body = { error: "You do not have permission to edit this property" };
            return;
        } 
        
        // Check if there is a location id in the request and verify it exist in the Location table
        const body = ctx.request.body;
        if (body.location_id){
            const isLocationIdValid = await locationModel.getById(ctx.request.body.location_id);
            if (!isLocationIdValid){ 
                ctx.status = 400;
                ctx.body = { message: "Bad Request: invalid locationId." };
                return;
            }
        }

        const { ID, agent_id, ...updateData } = body;
        const result = await model.updateById(id, updateData);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { ID: id, updated: true, link: ctx.request.path };
        } else {
            ctx.status = 400;
            ctx.body = { message: "Update Failed" };
        }
    } catch (err) {
        console.log("Error occured while updating property: ", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating the property." };
    }
}

async function deleteProperty(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Property ID." };
        return;
    }
    
    try {
        const existingData = await model.getById(id); // Fetch the existing property
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "Property not found." };
            return;
        }

        const property = existingData[0];

        // CHECK PERMISSION
        const permission = can.delete(ctx.state.user, property);
        if (!permission.granted) {
            ctx.status = 403; // Forbidden
            ctx.body = { error: "You do not have permission to delete this property" };
            return;
        } 

        const result = await model.deleteById(id);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { message: "Property deleted successfully." };
        } else {
            ctx.status = 404;
            ctx.body = { message: "Property not found." };
        }
    } catch (err) {
        console.log("Error occured while deleting property: ", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while deleting the property." };
    }
}


module.exports = router;