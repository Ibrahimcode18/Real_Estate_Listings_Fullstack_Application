const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');

const model = require('../models/locations');
const router = new Router({ prefix: '/api/v1/locations' });
const { validateLocation } = require('../controllers/validation');

// Routes
router.get('/', getAll);
router.post('/', bodyParser(), validateLocation,   createLocation);
router.get('/:id/properties', getPropertiesById);
// Add delete location.

// Handlers
async function getAll(ctx) {
    const data = await model.getAll();
    ctx.body = data;
}

async function createLocation(ctx) {
    try {
        const result = await model.add(ctx.request.body);
        if (result.affectedRows) {
            ctx.status = 201;
            ctx.body = { ID: result.insertId, created: true, link: `${ctx.request.path}/${result.insertId}` };
        }
    } catch (err) {
        ctx.status = 500;
        ctx.body = { message: "An error occurred while creating the location." };
    }
}

async function getPropertiesById(ctx) {
    const id = parseInt(ctx.params.id);
    const data = await model.getPropertiesById(id);
    if (data.length) {
        ctx.body = data;
    } else {
        ctx.status = 404;
        ctx.body = { message: "No properties found for this location." };
    }
}

module.exports = router;