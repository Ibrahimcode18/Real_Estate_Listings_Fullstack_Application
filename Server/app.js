const koa = require('koa');
const app = new koa();
const router = require('./router');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');

app.use(cors());
app.use(bodyParser());
app.use(router.routes()).use(router.allowedMethods());