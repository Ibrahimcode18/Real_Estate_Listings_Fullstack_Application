const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/agents');
const { validateAgent, validateAgentUpdate } = require('../controllers/validation');
const prefix = '/api/v1/agents';
const router = new Router({ prefix: prefix });

// Routes
router.post('/', bodyParser(), validateAgent, createAgent);
router.get('/', getAll);
router.get('/:id', getById);
router.get('/:id/properties', getPropertiesById);
router.put('/:id', bodyParser(), validateAgentUpdate, updateAgent);


// Route Handlers
async function createAgent(ctx) {
    const body = ctx.request.body;
    body.is_approved = 0; // New agents are not approved by default
    // body.user_id = parseInt(ctx.state.user.ID); // Assuming we have user info in state from authentication middleware
    try {
        const result = await model.add(body);
        if (result.affectedRows) {
            const id = result.insertId;
            ctx.status = 201;
            ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the agent." };
    }
}

async function getAll(ctx) {
    const results = await model.getAll();
    ctx.body = results;
}

async function getById(ctx) {
    const id = ctx.params.id;
    const result = await model.getById(id);
    if (result) {
        ctx.body = result;
    } else {
        ctx.status = 404;
        ctx.body = { message: "Agent not found." };
    }
}

async function getPropertiesById(ctx) {
    const agentId = ctx.params.id;
    const results = await model.getPropertiesById(agentId);
    if (results.length) {
        ctx.body = results;
    } else {
        ctx.status = 404;
        ctx.body = { message: "No properties found for this agent." };
    }
}

async function updateAgent(ctx) {
    const id = ctx.params.id;
    const body = ctx.request.body;
    try {
        const result = await model.updateById(id, body);
        if (result.affectedRows) {
            ctx.body = { ID: id, updated: true, link: `${ctx.request.path}` };
        } else {
            ctx.status = 404;
            ctx.body = { message: "Agent not found." };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating the agent." };
    }
}

module.exports = router;