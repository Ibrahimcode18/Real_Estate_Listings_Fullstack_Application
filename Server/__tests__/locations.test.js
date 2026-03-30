const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app'); 

const JWT_SECRET = 'my_super_secure_secret_key_123'; 

const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

describe('Locations API Endpoints', () => {
    
    let adminToken;
    let standardUserToken;

    beforeAll(() => {
        adminToken = generateToken({ ID: 1, role: 'admin' });
        standardUserToken = generateToken({ ID: 2, role: 'user' });
    });

    // Get all locations
    describe('GET /api/v1/locations', () => {
        it('should return 200 and a list of exactly 2 locations', async () => {
            const response = await request(app.callback())
                .get('/api/v1/locations')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(3); 
            
            expect(response.body[0]).toHaveProperty('image_url'); 
        });
    });

    // Get properties by location by ID
    describe('GET /api/v1/locations/:id/properties', () => {
        
        // Expected Failure (Authentication)
        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app.callback())
                .get('/api/v1/locations/2/properties');

            expect(response.status).toBe(401);
        });

        // Happy Path
        it('should return 200 and a list of properties for a valid location', async () => {
            const response = await request(app.callback())
                .get('/api/v1/locations/2/properties') 
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });

        // Expected Failure (404)
        it('should return 404 if no properties are found for the location', async () => {
            const response = await request(app.callback())
                .get('/api/v1/locations/999/properties')
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'No properties found for this location.');
        });

        // Edge Case
        it('should return 400 Bad Request if the ID is not a number', async () => {
            const response = await request(app.callback())
                .get('/api/v1/locations/abc/properties')
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid Property ID.'); 
        });
    });
        
    // Create new location
    describe('POST /api/v1/locations', () => {
        const newLocation = {
            city: "Birmingham",
            image_url: "http://example.com/birmingham.jpg"
        };

        // Authentication Check
        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app.callback())
                .post('/api/v1/locations')
                .send(newLocation);

            expect(response.status).toBe(401);
        });

        // Authorisation Check
        it('should return 403 Forbidden if a standard user tries to create a location', async () => {
            const response = await request(app.callback())
                .post('/api/v1/locations')
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send(newLocation);

            expect(response.status).toBe(403);
        });

        // Happy Path
        it('should return 201 Created when an Admin submits valid data', async () => {
            const response = await request(app.callback())
                .post('/api/v1/locations')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(newLocation);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('created', true);
        });
    });

    // Update location
    describe('PUT /api/v1/locations/:id', () => {
        const updateData = { city: "London Updated" };

        it('should return 403 Forbidden if a standard user tries to update', async () => {
            const response = await request(app.callback())
                .put('/api/v1/locations/2')
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send(updateData);

            expect(response.status).toBe(403);
        });

        it('should return 200 OK when an Admin updates a location', async () => {
            const response = await request(app.callback())
                .put('/api/v1/locations/2')
                .set('Authorization', `Bearer ${adminToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
        });
    });

    // Delete location
    describe('DELETE /api/v1/locations/:id', () => {
        it('should return 403 Forbidden if a standard user tries to delete', async () => {
            const response = await request(app.callback())
                .delete('/api/v1/locations/3')
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(403);
        });

        it('should return 200 OK when an Admin deletes a location', async () => {
            const response = await request(app.callback())
                .delete('/api/v1/locations/3')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
        });
    });
});