const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/users');
const { validateUser, validateUserUpdate } = require('../controllers/validation'); // Import our checker
const prefix = '/api/v1/users';
const router = new Router({ prefix: prefix });
const bcrypt = require('bcrypt');


// Routes
// We insert 'validateUser' BEFORE 'createUser'
// If validation fails, createUser never runs.
router.post('/', bodyParser(), validateUser, createUser);
router.get('/', getAll);
router.get('/:id', getById);
router.put('/:id', bodyParser(), validateUserUpdate, updateUser);
router.post('/login', loginUser);
// Add more routes like PUT /:id for updates, etc. as needed

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
    const authHeader = ctx.request.headers.authorization;   // Grab the Authorization header

    if (!authHeader || !authHeader.startsWith('Basic ')) {
        ctx.status = 401;
        ctx.body = { message: "Missing or invalid authorization header" };
        return;
    }

    // 2. Decode the Base64 string back into "username:password"
    const base64 = authHeader.split(' ')[1];
    const plainText = Buffer.from(base64, 'base64').toString('utf-8');
    const separatorIndex = plainText.indexOf(':');
    if (separatorIndex === -1) {
        ctx.status = 400;
        ctx.body = { message: "Invalid authorization payload format" };
        return;
    }

    const username = plainText.substring(0, separatorIndex);
    const password = plainText.substring(separatorIndex + 1);
    
    // 3. Look up the user in the database
    const result = await model.findByUsername(username);
    if (result.length === 0) {
        ctx.status = 401; // Unauthorized
        ctx.body = { message: "Invalid username or password" };
        return;
    }
    const user = result[0];
    // 4. Use Bcrypt to compare the typed password with the stored hash
    const isValid = bcrypt.compareSync(password, user.password);
    if (isValid) {
    // 5. Success! Strip out the password before sending the profile back
        delete user.password;

        ctx.status = 200;
        ctx.body = user; // Send the user data back to Pinia!
    } else {
        ctx.status = 401; // Unauthorized
        ctx.body = { message: "Invalid username or password" };
    }
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



// async function updateUser(ctx) {
//     const id = ctx.params.id;
//     const body = ctx.request.body;
//     // We will only allow updates to firstName, lastName, email, and password
//     const fieldsToUpdate = {};
//     if (body.firstName) fieldsToUpdate.firstName = body.firstName;
//     if (body.lastName) fieldsToUpdate.lastName = body.lastName;
//     if (body.email) fieldsToUpdate.email = body.email;
//     if (body.password) fieldsToUpdate.password = bcrypt.hashSync(body.password, 10);

module.exports = router;