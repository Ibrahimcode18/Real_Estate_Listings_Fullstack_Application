const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../app');

const JWT_SECRET = 'my_super_secure_secret_key_123'; 
const generateToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });


describe('Properties API Endpoints', () => {

    let standardUserToken;
    let suspendedAgentToken;
    let approvedAgentToken;

    beforeAll(() => {
        // A normal user (No agent_id)
        standardUserToken = generateToken({ ID: 2, role: 'user' });
        // A suspended agent.
        suspendedAgentToken = generateToken({ ID: 2, role: 'agent', agent_id: 999 });
        //  A fully approved agent. 
        approvedAgentToken = generateToken({ ID: 3, role: 'agent', agent_id: 1 });
    });

    //  Get all properties
    describe('GET /api/v1/properties', () => {
        
        it('should return 200', async () => {
            const response = await request(app.callback())
                .get('/api/v1/properties')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);
            expect(response.body[0]).toHaveProperty('title');
        });

    });
    // BY ID
    describe('GET /api/v1/properties/:id', () => {

        // Success
        it('should return 200 and the correct property for a valid ID', async () => {
            const response = await request(app.callback())
                .get('/api/v1/properties/1') 
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('id', 1);
            expect(response.body).toHaveProperty('title', 'London Flat');
            
            // Check for HATEOAS links 
            expect(response.body).toHaveProperty('links');
            expect(response.body.links).toHaveProperty('self');
        });

        // Expected Failure (404 Not Found)
        it('should return 404 if the property does not exist', async () => {
            const response = await request(app.callback())
                .get('/api/v1/properties/999');

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'Property not found');
        });

        //Bad Data Input
        it('should return 400 Bad Request if the ID is not a number', async () => {
            const response = await request(app.callback())
                .get('/api/v1/properties/invalid-text-id');

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid Property ID.');
        });
    });

    // Create Property
    describe('POST /api/v1/properties', () => {
        
        const newProperty = {
            title: "Beautiful New Test House",
            description: "A brand new listing for our automated tests",
            listing_type: "sale",
            price: 500000.00,
            location_id: 1
        };

        // Expected Failure: No Token (Authentication Check)
        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app.callback())
                .post('/api/v1/properties')
                .send(newProperty);
                
            expect(response.status).toBe(401);
        });

        // Expected Failure: Wrong Role (Authorisation Check)
        it('should return 403 Forbidden if a standard user tries to create a property', async () => {
            const response = await request(app.callback())
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send(newProperty);

            expect(response.status).toBe(403);
            expect(response.body.message).toMatch(/must have an agent profile/i);
        });

        // Expected Failure: Suspended Agent (Business Logic Check)
        it('should return 403 Forbidden if the agent is suspended or not approved', async () => {
            const response = await request(app.callback())
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${suspendedAgentToken}`)
                .send(newProperty);

            expect(response.status).toBe(403);
            expect(response.body.message).toMatch(/not being approved or you are suspended/i);
        });

        //  Edge Case: Bad Data (Foreign Key Check)
        it('should return 400 Bad Request if the location_id does not exist', async () => {
            const response = await request(app.callback())
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${approvedAgentToken}`)
                .send({ ...newProperty, location_id: 99999 }); // Bad location ID

            expect(response.status).toBe(400);
            expect(response.body.message).toMatch(/Invalid locationId/i);
        });

        // Success
        it('should return 201 Created when an approved agent submits valid data', async () => {
            const response = await request(app.callback())
                .post('/api/v1/properties')
                .set('Authorization', `Bearer ${approvedAgentToken}`)
                .send(newProperty);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('created', true);
            expect(response.body).toHaveProperty('ID');
        });

    });

    // Update Property
    describe('PUT /api/v1/properties/:id', () => {
        const updateData = {
            price: 1800.00,
            description: "Updated description for our automated test"
        };

        // Expected Failure: Authentication
        it('should return 401 Unauthorized if no token is provided', async () => {
            const response = await request(app.callback())
                .put('/api/v1/properties/1')
                .send(updateData);

            expect(response.status).toBe(401);
        });

        // Expected Failure: Authorisation
        it('should return 403 Forbidden if a standard user tries to update', async () => {
            const response = await request(app.callback())
                .put('/api/v1/properties/1') 
                .set('Authorization', `Bearer ${standardUserToken}`)
                .send(updateData);

            expect(response.status).toBe(403);
        });

        // Success
        it('should return 200 OK when the correct agent updates their property', async () => {
            const response = await request(app.callback())
                .put('/api/v1/properties/1')
                .set('Authorization', `Bearer ${approvedAgentToken}`)
                .send(updateData);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('updated', true);
        });
    });

    // Delete Property
    describe('DELETE /api/v1/properties/:id', () => {
        
        // Expected Failure: Authorisation
        it('should return 403 Forbidden if a standard user tries to delete', async () => {
            const response = await request(app.callback())
                .delete('/api/v1/properties/3')
                .set('Authorization', `Bearer ${standardUserToken}`);

            expect(response.status).toBe(403);
        });

        // Expected Failure: Not Found
        it('should return 404 Not Found if trying to delete a non-existent property', async () => {
            const response = await request(app.callback())
                .delete('/api/v1/properties/999')
                .set('Authorization', `Bearer ${approvedAgentToken}`);

            expect(response.status).toBe(404);
        });

        // Success
        it('should return 200 OK when the correct agent deletes the property', async () => {
            const response = await request(app.callback())
                .delete('/api/v1/properties/3') 
                .set('Authorization', `Bearer ${approvedAgentToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Property deleted successfully.');
        });
    });
});