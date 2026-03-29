const Router = require('koa-router');
const auth = require('../controllers/auth');
const { randomUUID } = require('crypto');
const mime = require('mime-types');
const fs = require('fs/promises'); // Use the Promise version of fs
const path = require('path');
const { createReadStream } = require('fs'); // Standard stream for reading
const router = new Router({ prefix: '/api/v1' });

// Define where to save files
const uploadDir = path.join(process.cwd(), 'uploads');

// Ensure the directory exists when the server starts
(async () => {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        console.log(`Storage directory confirmed: ${uploadDir}`);
    } catch (err) {
        console.error('Error creating upload dir:', err);
    }
})();

// The Upload Endpoint
router.post('/images', auth.requireJWT, async ctx => {
    try {
        // koa-body puts files in ctx.request.files
        const upload = ctx.request.files.upload;
        if (!upload) {
            ctx.status = 400;
            ctx.body = { message: "No file uploaded" };
            return;
        }
        // Generate a unique name
        const fileType = upload.type || 'image/jpeg';
        const extension = mime.extension(fileType);
        const imageName = `${randomUUID()}.${extension}`;
    
        const storagePath = path.join(uploadDir, imageName);
        await fs.copyFile(upload.filepath, storagePath);
        ctx.status = 201;
        ctx.body = {
            // Return the URL so the frontend can display it
            links: {
            path: `http://${ctx.host}/api/v1/images/${imageName}`
            }
        };
    } catch (err) {
    console.error(err);
    ctx.status = 500;
    ctx.body = { message: err.message };
    }
});

// The Download Endpoint (Serving the image)
router.get('/images/:filename', async ctx => {
    const filename = ctx.params.filename;
    const filePath = path.join(uploadDir, filename);
    try {
        // Check if file exists
        await fs.access(filePath);
        // Stream it back to the browser
        const src = createReadStream(filePath);
        ctx.type = mime.lookup(filePath) || 'application/octet-stream';
        ctx.body = src;
    } catch (err) {
        ctx.status = 404;
    }
});
module.exports = router;