const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const model = require('../models/users');
const { validateUser } = require('../controllers/validation'); // Import our checker
const prefix = '/api/v1/users';
const router = new Router({ prefix: prefix });
// const bcrypt = require('bcrypt');

// Routes
// We insert 'validateUser' BEFORE 'createUser'
// If validation fails, createUser never runs.
router.post('/', bodyParser(), validateUser, createUser);
// router.get('/:id', getById);
// router.post('/login', loginUser);

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

// async function getById(ctx) {
//     const id = ctx.params.id;
//     const result = await model.getById(id);
//     if (result.length) {
//         const user = result[0];
//         // IMPORTANT: Never send the password back, even the hash!
//         delete user.password;
//         delete user.passwordSalt;
//         ctx.body = user;
//     }

// }

// async function loginUser(ctx) {
//     const authHeader = ctx.request.headers.authorization;   // Grab the Authorization header

//     if (!authHeader || !authHeader.startsWith('Basic ')) {
//         ctx.status = 401;
//         ctx.body = { message: "Missing or invalid authorization header" };
//         return;
//     }

//     // 2. Decode the Base64 string back into "username:password"
//     const base64 = authHeader.split(' ')[1];
//     const plainText = Buffer.from(base64, 'base64').toString('utf-8');
//     const [username, password] = plainText.split(':');
//     // 3. Look up the user in the database
//     const result = await model.findByUsername(username);
//     if (result.length === 0) {
//         ctx.status = 401; // Unauthorized
//         ctx.body = { message: "Invalid username or password" };
//         return;
//     }
//     const user = result[0];
//     // 4. Use Bcrypt to compare the typed password with the stored hash
//     const isValid = bcrypt.compareSync(password, user.password);
//     if (isValid) {
//     // 5. Success! Strip out the password before sending the profile back
//         delete user.password;
//         delete user.passwordSalt;

//         ctx.status = 200;
//         ctx.body = user; // Send the user data back to Pinia!
//     } else {
//         ctx.status = 401; // Unauthorized
//         ctx.body = { message: "Invalid username or password" };
//     }
// }

module.exports = router;