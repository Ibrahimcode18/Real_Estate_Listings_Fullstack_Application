const Router = require('koa-router');
const auth = require('../controllers/auth');
const { randomUUID } = require('crypto');
const mime = require('mime-types');
const fs = require('fs/promises'); 
const cloudinary = require('cloudinary').v2; // Added Cloudinary

const router = new Router({ prefix: '/api/v1' });

// Configure Cloudinary using Environment Variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

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

        // Generate a unique name for the image
        const fileType = upload.type || 'image/jpeg';
        const extension = mime.extension(fileType);
        const uuid = randomUUID(); 
        const imageName = `${uuid}.${extension}`;
        

        // Send the file to Cloudinary
        const result = await cloudinary.uploader.upload(upload.filepath, {
            folder: 'RealEstate',
            public_id: uuid
        });

        // Clean up: delete the temporary file from the server so it doesn't clog memory
        await fs.unlink(upload.filepath).catch(err => console.error("Temp file delete error:", err));

        ctx.status = 201;
        ctx.body = {
            // Return the live Cloudinary URL so the frontend can display/save it
            links: {
                path: result.secure_url 
            }
        };
    } catch (err) {
        console.error(err);
        ctx.status = 500;
        ctx.body = { message: err.message };
    }
});

module.exports = router;