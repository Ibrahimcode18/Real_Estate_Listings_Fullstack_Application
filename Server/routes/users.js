const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/users');
const agentModel = require('../models/agents')
const { validateUser, validateUserUpdate } = require('../controllers/validation'); // Import our checker
const prefix = '/api/v1/users';
const router = new Router({ prefix: prefix });
const bcrypt = require('bcrypt');

const auth = require('../controllers/auth');
const jwt = require('jsonwebtoken');
// Routes
// We insert 'validateUser' BEFORE 'createUser'
// If validation fails, createUser never runs.
router.post('/', bodyParser(), validateUser, createUser);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', bodyParser(), validateUserUpdate, updateUser);
router.post('/login', auth.requireBasic, loginUser);

async function createUser(ctx) {
    const body = ctx.request.body;

    // Try to add to DB
    try {
        const result = await model.add(body);
        if (result.affectedRows) {
            const id = result.insertId;
            ctx.status = 201;
            ctx.body = { ID: id, created: true, link: `${ctx.request.path}/${id}` };
        }
    } catch (err) {
    // Handle duplicates (Unique constraint violation)
        if (err.code === 'ER_DUP_ENTRY') {
            ctx.status = 409; // Conflict
            ctx.body = { message: "Username or Email already exists." };
        } else {
            ctx.status = 500; // Internal Server Error
            ctx.body = { message: "An error occurred while creating the user." };
        }
    }
}

async function getAll(ctx) {  // Anybody can access this for now, but we will add authentication later
    const results = await model.getAll();
    ctx.body = results.map(u => {
        const user = { ...u };
        delete user.password;
        return user;
    });
}

async function getById(ctx) { // Anybody can access this for now, but we will add authentication later
    const id = ctx.params.id;
    const result = await model.getById(id);
    if (result.length) {
        const user = result[0];
        // IMPORTANT: Never send the password back, even the hash!
        delete user.password;
        ctx.body = user;
    } else {
        ctx.status = 404;
        ctx.body = { message: "User not found" };
    }
}

async function loginUser(ctx) {
    // Because the requireBasic guard passed, ctx.state.user is already populated!
    const user = ctx.state.user;

    // Get the user's agent_id for easier creation of properties
    const agentInfo = await agentModel.getByUserId(user.id);
    // Define the payload (claims) we want to embed in the token
    const payload = {
        ID: user.id,
        username: user.username,
        role: user.role,
        agent_id: agentInfo.length ? agentInfo[0].id : null
    };
    
    // Sign the token (Must match the secret in strategies/jwt.js)
    const token = jwt.sign(payload, 'my_super_secure_secret_key_123', { expiresIn: '1h' });
    ctx.status = 200;
    ctx.body = {
        message: "Login successful",
        token: token,
        user: payload
    };
}


async function updateUser(ctx) {
    const id = ctx.params.id;
    const body = ctx.request.body;
    const fieldsToUpdate = ctx.request.body;

    if (body.password) {
        fieldsToUpdate.password = bcrypt.hashSync(body.password, 10);
    }
    try {
        const result = await model.updateById(id, fieldsToUpdate);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { message: "User updated successfully." };
        } else {
            ctx.status = 404;
            ctx.body = { message: "User not found." };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating the user." };
    }  
}





module.exports = router;