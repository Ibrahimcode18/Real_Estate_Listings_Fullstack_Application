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

const can = require('../permissions/users');
// Routes
// We insert 'validateUser' BEFORE 'createUser'
// If validation fails, createUser never runs.
router.post('/', bodyParser(), validateUser, createUser);
router.get('/', auth.requireJWT, getAll);
router.get('/:id', auth.requireJWT, getById);
router.put('/:id', auth.requireJWT, bodyParser(), validateUserUpdate, updateUser);
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

async function getAll(ctx) {  
    try{
        const permission = can.readAll(ctx.state.user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: Only admins can view all users." };
            return;
        }

        const results = await model.getAll();
        ctx.body = results.map(u => {
            const user = { ...u };
            delete user.password;
            user.links = {
                self: `http://${ctx.host}${prefix}/${user.id}`
            }
            return user;
        });
    } catch (err){
        console.log("An Error occured fetching all users", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching all users"}
    }   
}

async function getById(ctx) { 
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid User ID." };
        return;
    }

    try{
        const existingData = await model.getById(id); // Fetch the existing user
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "User not found." };
            return;
        }
        const user = existingData[0];

        const permission = can.read(ctx.state.user, user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You do not have access to this data" };
            return;
        }

        // IMPORTANT: Never send the password back, even the hash!
        delete user.password;
        user.links = {
            self: `http://${ctx.host}${prefix}/${user.id}`,
            update: `http://${ctx.host}${prefix}/${user.id}`
        };
        ctx.body = user;
            
    } catch (err){
        console.log("An Error occured fetching user details", err);
        ctx.status = 500;
        ctx.body = { message: "An error occured while fetching user details"}
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
        agent_id: agentInfo.length ? agentInfo[0].id : null,
        links: `${prefix}/${user.id}`
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
    const id = Number(ctx.params.id);
    if (isNaN(id) || !Number.isInteger(id) || id <= 0) {
        ctx.status = 400;
        ctx.body = { message: "Invalid User ID." };
        return;
    }

    try{
        const existingData = await model.getById(id); // Fetch the existing user
        if (!existingData.length) {
            ctx.status = 404;
            ctx.body = { message: "User not found." };
            return;
        }
        const user = existingData[0];

        const permission = can.update(ctx.state.user, user);
        if (!permission.granted) {
            ctx.status = 403;
            ctx.body = { message: "Forbidden: You do not have permission make an update" };
            return;
        }
        const body = ctx.request.body;
        const fieldsToUpdate = ctx.request.body;

        if (body.password) {
            fieldsToUpdate.password = bcrypt.hashSync(body.password, 10);
        }
        
        const result = await model.updateById(id, fieldsToUpdate);
        if (result.affectedRows) {
            ctx.status = 200;
            ctx.body = { message: "User updated successfully.", link: ctx.request.path };
        } 
    }catch (err) {
        console.log("Error occured while trying to update user: ", err);
        ctx.status = 500;
        ctx.body = { message: "An error occurred while updating the user." };
    }
}





module.exports = router;