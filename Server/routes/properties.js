const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/properties');
const locationModel = require('../models/locations');
const agentModel = require('../models/agents'); 

const router = new Router({ prefix: '/api/v1/properties' }); // Prefix means all routes here start with /api/v1/properties

const { validateProperty } = require('../controllers/validation');

// Routes
router.get('/', getAll);
router.get('/:id', getById)
router.post('/', bodyParser(), validateProperty, createProperty);

// Handlers
async function getAll(ctx) {
    const data = await model.getAll();
    ctx.body = data;
}

async function createProperty(ctx) {
    const isAgentIdValid = await agentModel.findAgentById(ctx.request.body.agent_id);
    const isLocationIdValid = await locationModel.findLocationById(ctx.request.body.location_id);
    if (!isAgentIdValid.length) {  // If the agentId doesn't exist in the agents table, it is considered unauthorised.
        ctx.status = 401;
        ctx.body = { message: "Unauthorized: Invalid agentId." };
        return;
    }
    if (!isLocationIdValid.length) { // If the locationId doesn't exist in the locations table, it is considered a bad request.
        ctx.status = 400;
        ctx.body = { message: "Invalid locationId. No such location exists." };
        return;
    }
    try{
        const result = await model.add(ctx.request.body);
        if (result.affectedRows) {
            ctx.status = 201;
            ctx.body = { ID: result.insertId, created: true, link: `${ctx.request.path}/${result.insertId}` };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the property." };
    }
}

async function getById(ctx){
    const id = parseInt(ctx.params.id);
    const data = await model.getById(id);
    if(data.length) {
        ctx.body = data;
    } else {
        ctx.status = 404;
        ctx.body = { message: "Property not found" };
    }
}


module.exports = router;