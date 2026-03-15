const Koa = require('koa');
const cors = require('@koa/cors');
const app = new Koa();
const properties = require('./routes/properties.js');
const users = require('./routes/users.js');
const locations = require('./routes/locations.js');

app.use(cors());
app.use(properties.routes());
app.use(users.routes());
app.use(locations.routes());
app.listen(3000);
console.log('Server running on port 3000');