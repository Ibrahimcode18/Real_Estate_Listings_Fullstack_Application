const Koa = require('koa');
const cors = require('@koa/cors');
const app = new Koa();
const { koaBody } = require('koa-body');

const properties = require('./routes/properties.js');
const users = require('./routes/users.js');
const locations = require('./routes/locations.js');
const agents = require('./routes/agents.js');
const uploads = require('./routes/uploads');

app.use(koaBody({
    multipart: true, // This enables file catching
    formidable: {
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
    },
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE']
}));

app.use(cors());
app.use(properties.routes());
app.use(users.routes());
app.use(locations.routes());
app.use(agents.routes());
app.use(uploads.routes());

app.listen(3000);
console.log('Server running on port 3000');