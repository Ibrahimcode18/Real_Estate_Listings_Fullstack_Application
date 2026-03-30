const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/agents');
const { validateAgent, validateAgentUpdate } = require('../controllers/validation');
const prefix = '/api/v1/agents';
const router = new Router({ prefix: prefix });

const auth = require('../controllers/auth');
const can = require('../permissions/agents');

// Routes
router.post('/', auth.requireJWT, bodyParser(), validateAgent, createAgent);
router.get('/', auth.requireJWT, getAll);
router.get('/:id', auth.requireJWT, getById);
router.get('/:id/properties', auth.requireJWT, getPropertiesById);
router.put('/:id', auth.requireJWT, bodyParser(), validateAgentUpdate, updateAgent);
router.patch('/:id/approve', auth.requireJWT, approveAgent);
router.patch('/:id/suspend', auth.requireJWT, suspendAgent);


// Route Handlers
async function createAgent(ctx) {
    const body = ctx.request.body;
    body.is_approved = 0; // New agents are not approved by default
    body.user_id = ctx.state.user.id;
    try {
        const result = await model.add(body);
        if (result.affectedRows) {
            const id = result.insertId;
            ctx.status = 201;
            ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
        }
    } catch (err) {
        console.log("Error occured while creating agent: ", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the agent." };
    }
}

async function getAll(ctx) {
    try{
        const permission = can.readAll(ctx.state.user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Only admins can view all agents." };
            return;
        }
        
        const results = await model.getAll();
        ctx.body = results.map( a => {
            const agent = { ...a };
            agent.links = {
                self: `http://${ctx.host}${prefix}/${agent.id}`
            }
            return agent;
        });
    } catch (err){
        console.log("An Error occured fetching all agents", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching all agents"}
    }
    
}

async function getById(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Agent ID." };
        return;
    }

    try{
        const result = await model.getById(id);
        if (!result.length){
            ctx.status = 404;
            ctx.body = { message: "Agent not found." };
            return;
        }
        const agent = result[0];

        const permission = can.read(ctx.state.user, agent);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You do not have access to this data" };
            return;
        }
        const permission2 = can.update(ctx.state.user, agent);
        if (permission2.granted){
            agent.links = {
                self:  `http://${ctx.host}${prefix}/${agent.id}`,
                update: `http://${ctx.host}${prefix}/${agent.id}`
            };
        }
        ctx.body = agent;

    } catch (err){
        console.log("An Error occured fetching agent details", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching agent details"}
    }
}

async function getPropertiesById(ctx) {
    const agentId = Number(ctx.params.id);
    if (isNaN(agentId) || !Number.isInteger(agentId) || agentId <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Agent ID." };
        return;
    }

    try{
        const permission = can.readAllProperties(ctx.state.user, agentId); 
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You do not own these properties." };
            return;
        }

        const data = await model.getPropertiesById(agentId);
        if (data.length) {
            ctx.body = data.map(post => {
                const { id, title, description, listing_type, price, location, image_url } = post;
                
                const links = {
                    self: `http://${ctx.host}/api/v1/properties/${id}`
                }
                return { id, title, description, listing_type, price, location, image_url, links };
            });

        } else {
            ctx.status = 404;
            ctx.body = { message: "No properties found for this agent." };
        }

    } catch (err) {
        console.error("Error fetching properties by agent:", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while fetching properties by agent" };
    }
    
}

async function updateAgent(ctx) {
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Agent ID." };
        return;
    }

    try{
        const existingData = await model.getById(id); // Fetch the existing user
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "Agent not found." };
            return;
        }
        const agent = existingData[0];

        const permission = can.update(ctx.state.user, agent);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You do not have permission make an update" };
            return;
        }

        const body = ctx.request.body;
        const fieldsToUpdate = ctx.request.body;

        const result = await model.updateById(id, fieldsToUpdate);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { message: "Agent updated successfully.", link: ctx.request.path };
        } 
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating the agent." };
    }
}

async function approveAgent(ctx){
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Agent ID." };
        return;
    }

    try{
        const permission = can.approve(ctx.state.user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Only admins can perform this action." };
            return;
        }

        const existingData = await model.getById(id);
        if (!existingData.length){
            ctx.status = 404;
            ctx.body = { message: "Agent not found." };
            return;
        }

        const userId = existingData[0].user_id;
        const result1 = await model.approve(id);
        if (result1.affectedRows){
            const result2 = await model.updateRole(userId);
            if (result2.affectedRows){
                ctx.status = 200;
                ctx.body = { message: "Agent approved successfully.", link: `${prefix}/${id}` };
            }
        }
    } catch (err){
        console.log("An Error occured fetching agent details", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching agent details"}
    }
}

async function suspendAgent(ctx){
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid Agent ID." };
        return;
    }

    try{
        const permission = can.suspend(ctx.state.user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Only admins can perform this action." };
            return;
        }

        const existingData = await model.getById(id);
        if (!existingData.length){
            ctx.status = 404;
            ctx.body = { message: "Agent not found." };
            return;
        }
        if (ctx.state.user.agent_id === id){
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You cannot suspend yourself." };
            return;
        }
        const result1 = await model.suspend(id);
        if (result1.affectedRows){
            ctx.status = 200;
            ctx.body = { message: "Agent suspended successfully.", link: `${prefix}/${id}` };
        }
    } catch (err){
        console.log("An Error occured fetching agent details", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching agent details"}
    }
}

module.exports = router;