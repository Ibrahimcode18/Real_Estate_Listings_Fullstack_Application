const Router = require('koa-router');
const bodyParser = require('koa-bodyparser');
const db = require('../helpers/database'); 
// Prefix means all routes here start with /api/v1/properties
const router = new Router({ prefix: '/api/v1/properties' });

// Routes
router.get('/', getAll);
router.get('/:id', getById)
router.post('/', bodyParser(), createProperty); // We will build this next
router.delete('/:id', (ctx) => {});

// Handlers
async function getAll(ctx) {
    const urlquery = ctx.request.query.q;
    const page = parseInt(ctx.request.query.page);
    const limit = parseInt(ctx.request.query.limit);
    const offset = (page - 1) * limit;
    if (urlquery) {
        // const filtered = articles.filter(article => article.title.toLowerCase().includes(urlquery.toLowerCase()));
        const query = "SELECT * FROM articles WHERE title LIKE ?";
        const data = await db.run_query(query, [`%${urlquery}%`]);
        if (data.length){
            ctx.body = data;
        } else {
            ctx.body = {message: "No articles found matching the query"};
        }
    } else if (page && limit) {
        const query = "SELECT * FROM articles LIMIT ? OFFSET ?";
        const data = await db.run_query(query, [limit, offset]);
        ctx.body = data;
    } else {
        const query = "SELECT * FROM properties";
        const data = await db.run_query(query, []);
        ctx.body = data;
    }
}

async function createProperty(ctx) {
    const { title, allText } = ctx.request.body;
    // Simple validation
    if(!title || !allText) {
        ctx.status = 400;
        ctx.body = { message: "Title and fullText are required" };
        return;
    }
    // let id = articles.length + 1;
    // const newArticle = { id, title, fullText };
    // articles.push(newArticle);
    // Change your query and your data array like this:
    const query = "INSERT INTO articles (title, allText) VALUES (?, ?)";
    const result = await db.run_query(query, [title, allText]);
    ctx.status = 201; // Created
    ctx.body = { ID: result.insertId, created: true };
}

async function getById(ctx){
    const id = parseInt(ctx.params.id);
    const query = "SELECT * FROM articles WHERE id = ?";
    const data = await db.run_query(query, [id]);
    if(data.length) {
        ctx.body = data;
    } else {
        ctx.status = 404;
        ctx.body = { message: "Article not found" };
    }
}

module.exports = router;