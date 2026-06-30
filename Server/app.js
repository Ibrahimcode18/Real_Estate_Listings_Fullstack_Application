const Koa = require('koa');
const cors = require('@koa/cors');
const app = new Koa();
const { koaBody } = require('koa-body');

const { koaSwagger } = require('koa2-swagger-ui');
const yaml = require('yamljs');

const port = process.env.PORT || 3000;
const properties = require('./routes/properties.js');
const users = require('./routes/users.js');
const locations = require('./routes/locations.js');
const agents = require('./routes/agents.js');
const uploads = require('./routes/uploads');
const spec = yaml.load('./schemas/openapi.yaml');

app.use(koaBody({
    multipart: true,
    formidable: {
        keepExtensions: true,
        maxFileSize: 5 * 1024 * 1024,
    },
    parsedMethods: ['POST', 'PUT', 'PATCH', 'DELETE']
}));
app.use(koaSwagger({ routePrefix: '/api/v1/docs', swaggerOptions: { spec } }));

app.use(cors());
app.use(properties.routes());
app.use(users.routes());
app.use(locations.routes());
app.use(agents.routes());
app.use(uploads.routes());


if (process.env.NODE_ENV !== 'test') { 
    app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
}
module.exports = app; 